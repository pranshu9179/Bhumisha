import { API_BASE_URL, apiClient } from "@/services/api/client";

function unwrapList(response, keys = ["data", "categories", "cropCategories", "users", "cropDetails", "cropDiseases", "diseases"]) {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }
  return [];
}

function unwrapPagination(response) {
  if (!response || Array.isArray(response)) return null;
  const source = response.pagination || response.data?.pagination || response;
  return {
    total:
      source.total ??
      source.totalRecords ??
      source.count ??
      unwrapList(response).length,
    page: source.page ?? 1,
    limit: source.limit,
    totalPages: source.totalPages ?? 1,
  };
}

function unwrapRecord(response) {
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
}

function localized(record, locale = "english") {
  return record?.[locale] || record?.english || record || {};
}

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function assetBaseUrl() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }
}

function normalizeAssetUrl(value) {
  if (!value) return "";
  if (Array.isArray(value)) return normalizeMedia(value)[0] || "";
  if (typeof value === "object") return normalizeMedia(value)[0] || "";
  if (typeof value !== "string") return value;

  const trimmed = value.trim().replaceAll("\\", "/");
  if (!trimmed) return "";
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;

  const baseUrl = assetBaseUrl();
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${path}`;
}

function normalizedProfileImage(...values) {
  return normalizeAssetUrl(firstPresent(...values));
}

function normalizeAuthSession(response) {
  const sourceUser =
    response?.user || response?.data?.user || response?.data || response;
  const token =
    response?.token || response?.accessToken || response?.data?.token;
  const role = String(sourceUser?.role || "admin").toLowerCase();

  return {
    token,
    user: {
      id: sourceUser?.id,
      name:
        sourceUser?.name ||
        sourceUser?.username ||
        sourceUser?.phone ||
        "Bhumisha User",
      username: sourceUser?.username,
      email: sourceUser?.email || "",
      phone: sourceUser?.phone || "",
      ...sourceUser,
      avatar: normalizedProfileImage(sourceUser?.avatar, sourceUser?.profile_image),
      profile_image: normalizedProfileImage(sourceUser?.profile_image, sourceUser?.avatar),
      role,
      password: undefined,
    },
  };
}

function toApiRole(role) {
  const normalized = String(role || "").toLowerCase();
  const roleMap = {
    user: "User",
    expert: "Expert",
    vendor: "Vendor",
    employee: "Employee",
    admin: "Admin",
  };
  return roleMap[normalized] || role;
}

function normalizeUser(record) {
  const source = unwrapRecord(record) || {};
  const deleteFlag = source.is_delete ?? source.isDelete;
  const statusValue = source.status ?? source.is_active ?? source.active;
  const isDeleted =
    deleteFlag === true ||
    deleteFlag === 1 ||
    deleteFlag === "1" ||
    String(statusValue || "").toLowerCase() === "disabled";

  return {
    ...source,
    id: source.id ?? source._id,
    name:
      source.name ||
      source.username ||
      source.fullName ||
      source.phone ||
      "Bhumisha User",
    username: source.username || "",
    email: source.email || "",
    phone: source.phone || "",
    avatar: normalizedProfileImage(source.avatar, source.profile_image),
    profile_image: normalizedProfileImage(source.profile_image, source.avatar),
    role: String(source.role || "user").toLowerCase(),
    status: isDeleted ? "inactive" : String(statusValue || "active").toLowerCase(),
    is_delete: isDeleted,
    otp_verify: source.otp_verify,
    lastActive: source.lastActive ?? source.last_active ?? source.updated_at ?? source.updatedAt,
    createdAt: source.createdAt ?? source.created_at,
    updatedAt: source.updatedAt ?? source.updated_at,
    password: undefined,
  };
}

function normalizeCategory(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = Boolean(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );
  return {
    ...record,
    id: english.id ?? record?.id,
    name:
      english.name ??
      english.cropCategory ??
      record?.name ??
      record?.cropCategory,
    name_hi: firstPresent(
      hindi.name,
      hindi.cropCategory,
      hindi.cropCategory_hi,
      record?.cropCategory_hi,
      record?.name_hi,
      record?.hindi_name,
      record?.name_hindi,
    ),
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    productCount: record?.productCount ?? record?.cropCount ?? 0,
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt,
  };
}

function normalizeCrop(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const category = english.category || record?.category || {};
  const isDeleted = Boolean(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );
  return {
    ...record,
    id: english.id ?? record?.id,
    name: firstPresent(english.name, record?.name),
    name_hi: firstPresent(hindi.name, record?.name_hi, record?.hindi_name, record?.name_hindi),
    description: firstPresent(english.description, record?.description),
    description_hi: firstPresent(
      hindi.description,
      record?.description_hi,
      record?.hindi_description,
      record?.description_hindi,
    ),
    categoryId:
      english.crop_category_id ?? record?.crop_category_id ?? category.id,
    categoryName: category.name ?? record?.categoryName,
    image: normalizeAssetUrl(
      firstPresent(english.crop_theme_image, english.image, record?.crop_theme_image, record?.image),
    ),
    sku: record?.sku ?? `CROP-${english.id ?? record?.id ?? ""}`,
    price: record?.price ?? 0,
    stock: record?.stock ?? 0,
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt,
  };
}

function normalizeCropDetail(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = Boolean(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );
  return {
    ...record,
    id: english.id ?? record?.id,
    cropId: english.crop_id ?? record?.crop_id,
    cropName: firstPresent(english.crop_name, record?.crop_name, record?.cropName),
    cropName_hi: firstPresent(hindi.crop_name, record?.crop_name_hi),
    title: firstPresent(english.title, record?.title),
    title_hi: firstPresent(hindi.title, record?.title_hi, record?.hindi_title, record?.title_hindi),
    description: firstPresent(english.description, record?.description),
    description_hi: firstPresent(
      hindi.description,
      record?.description_hi,
      record?.hindi_description,
      record?.description_hindi,
    ),
    sequence: english.sequence ?? record?.sequence,
    images: normalizeMedia(
      firstPresent(english.crop_details_theme_image, english.images, english.media, record?.crop_details_theme_image, record?.images, record?.media),
    ),
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt ?? record?.created_at,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt ?? record?.updated_at,
  };
}

function normalizeCropDisease(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = Boolean(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );
  const media = firstPresent(
    english.medial_url,
    english.media_url,
    english.disease_image,
    english.disease_images,
    english.images,
    english.image,
    record?.medial_url,
    record?.media_url,
    record?.disease_image,
    record?.disease_images,
    record?.images,
    record?.image,
  );

  return {
    ...record,
    id: english.id ?? record?.id ?? record?._id,
    cropId: firstPresent(english.crop_id, record?.crop_id, record?.cropId),
    cropName: firstPresent(english.crop_name, record?.crop_name, record?.cropName),
    cropName_hi: firstPresent(hindi.crop_name, record?.crop_name_hi),
    title: firstPresent(english.title, record?.title),
    title_hi: firstPresent(hindi.title, record?.title_hi),
    description: firstPresent(english.description, record?.description),
    description_hi: firstPresent(hindi.description, record?.description_hi),
    medial_url: normalizeMedia(media),
    existing_medial_url: normalizeMedia(media),
    mediaPublicIds: firstPresent(
      english.media_public_ids,
      english.public_ids,
      record?.media_public_ids,
      record?.public_ids,
      [],
    ),
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt ?? record?.created_at,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt ?? record?.updated_at,
  };
}

function normalizeMedia(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeMedia(item))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeMedia(parsed);
    } catch {
      return [normalizeAssetUrl(value)].filter(Boolean);
    }
  }
  if (typeof value === "object") {
    const mediaValue = firstPresent(
      value.secure_url,
      value.secureUrl,
      value.url,
      value.media_url,
      value.image_url,
      value.file_url,
      value.original_url,
      value.originalUrl,
      value.thumbnail_url,
      value.thumbnailUrl,
      value.path,
      value.file_path,
      value.filename,
      value.name,
      value.avatar,
      value.profile_image,
      value.medial_url,
      value.disease_image,
      value.crop_theme_image,
      value.crop_guid_media,
      value.crop_details_theme_image,
    );
    return mediaValue ? normalizeMedia(mediaValue) : [value];
  }
  return [value].filter(Boolean);
}

function normalizeHeading(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = Boolean(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );
  return {
    ...record,
    id: english.id ?? record?.id,
    title: firstPresent(english.title, record?.title),
    title_hi: firstPresent(hindi.title, record?.title_hi, record?.hindi_title, record?.title_hindi),
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt,
  };
}

function normalizeGuideDetail(record, context = {}) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = Boolean(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );

  return {
    ...record,
    id:
      english.id ??
      english.detail_id ??
      record?.id ??
      record?.detail_id,
    cropId:
      english.crop_id ??
      record?.crop_id ??
      context.cropId,
    cropName:
      context.cropName ??
      english.crop_name ??
      record?.crop_name,
    cropName_hi:
      context.cropName_hi ??
      hindi.crop_name ??
      record?.crop_name_hi,
    headingId:
      english.crops_guid_heading_id ??
      english.heading_id ??
      record?.crops_guid_heading_id ??
      record?.heading_id ??
      context.headingId,
    headingName:
      context.headingName ??
      english.heading_name ??
      english.heading_title ??
      record?.heading_name,
    headingName_hi:
      context.headingName_hi ??
      hindi.heading_name ??
      hindi.heading_title ??
      record?.heading_name_hi,
    title: firstPresent(english.title, record?.title),
    title_hi: firstPresent(hindi.title, record?.title_hi, record?.hindi_title, record?.title_hindi),
    description: firstPresent(english.description, record?.description),
    description_hi: firstPresent(
      hindi.description,
      record?.description_hi,
      record?.hindi_description,
      record?.description_hindi,
    ),
    media: normalizeMedia(
      firstPresent(
        english.media,
        english.crop_guid_media,
        english.images,
        english.image,
        record?.media,
        record?.crop_guid_media,
        record?.images,
        record?.image,
      ),
    ),
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt,
  };
}

function normalizeGuideDetailsResponse(response) {
  const source = Array.isArray(response)
    ? response
    : unwrapList(response).length
      ? unwrapList(response)
      : [unwrapRecord(response)].filter(Boolean);

  const details = source.flatMap((cropGroup) => {
    const englishCrop = localized(cropGroup);
    const hindiCrop = localized(cropGroup, "hindi");
    const headings = englishCrop.headings || cropGroup?.headings || [];
    const hindiHeadings = hindiCrop.headings || [];
    const hindiHeadingById = new Map(
      hindiHeadings.map((heading) => [
        String(heading.heading_id ?? heading.id),
        heading,
      ]),
    );

    return headings.flatMap((heading, headingIndex) => {
      const headingId = heading.heading_id ?? heading.id;
      const hindiHeading =
        hindiHeadingById.get(String(headingId)) || hindiHeadings[headingIndex] || {};
      const headingDetails = heading.details || [];
      const hindiDetailsById = new Map(
        (hindiHeading.details || []).map((detail) => [
          String(detail.id ?? detail.detail_id),
          detail,
        ]),
      );

      return headingDetails.map((detail, detailIndex) => {
        const detailId = detail.id ?? detail.detail_id;
        const hindiDetail =
          hindiDetailsById.get(String(detailId)) ||
          (hindiHeading.details || [])[detailIndex] ||
          {};
        return normalizeGuideDetail(
          { english: detail, hindi: hindiDetail },
          {
            cropId: englishCrop.crop_id ?? cropGroup?.crop_id,
            cropName: englishCrop.crop_name,
            cropName_hi: hindiCrop.crop_name,
            headingId,
            headingName: heading.heading_name ?? heading.title,
            headingName_hi: hindiHeading.heading_name ?? hindiHeading.title,
          },
        );
      });
    });
  });

  return Object.assign(details, { groups: source });
}

function appendFiles(formData, fieldName, value) {
  if (!value) return;
  const isFileList =
    typeof FileList !== "undefined" && value instanceof FileList;
  const files = isFileList ? Array.from(value) : Array.isArray(value) ? value : [value];
  files.filter(Boolean).forEach((file) => formData.append(fieldName, file));
}

function listResult(response, normalizer) {
  const data = unwrapList(response).map(normalizer);
  const pagination = unwrapPagination(response);
  return Object.assign(data, { pagination });
}

function toFormData(payload = {}, fileFields = []) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value == null || value === "") return;
    const shouldAppendFiles = fileFields.includes(key);
    const isFileList =
      typeof FileList !== "undefined" && value instanceof FileList;
    if (isFileList) {
      Array.from(value).forEach((file) => formData.append(key, file));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) =>
        formData.append(key, shouldAppendFiles ? item : JSON.stringify(item)),
      );
      return;
    }
    formData.append(key, value);
  });
  return formData;
}

function cropDiseaseFormData(payload = {}) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (key === "disease_image") {
      appendFiles(formData, key, value);
      return;
    }
    if (key === "existing_medial_url" || key === "existing_media_public_ids") {
      formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
      return;
    }
    formData.append(key, value);
  });
  return formData;
}

function jsonConfig() {
  return { headers: { "Content-Type": "application/json" } };
}

function formConfig() {
  return { headers: { "Content-Type": "multipart/form-data" } };
}

export const authApi = {
  register: async (payload) =>
    (
      await apiClient.post(
        "/auth/register",
        toFormData(payload, ["profile_image"]),
        formConfig(),
      )
    ).data,
  verifyOtp: async (payload) =>
    (await apiClient.post("/auth/verify-otp", payload, jsonConfig())).data,
  resendOtp: async (payload) =>
    (await apiClient.post("/auth/resend", payload, jsonConfig())).data,
  login: async (payload) => {
    const username = payload.username || payload.email;
    return normalizeAuthSession(
      (
        await apiClient.post(
          "/auth/login",
          { username, password: payload.password },
          jsonConfig(),
        )
      ).data,
    );
  },
  logout: async () => (await apiClient.post("/auth/logout")).data,
  forgotPassword: async (payload) =>
    (await apiClient.post("/auth/forget-password", payload, jsonConfig())).data,
  resetPassword: async (payload) => authApi.forgotPassword(payload),
  updateProfileImage: async (payload) =>
    (
      await apiClient.put(
        "/auth/update-profile-image",
        toFormData(payload, ["profile_image"]),
        formConfig(),
      )
    ).data,
};

export const cropCategoriesApi = {
  list: async (params = {}) =>
    listResult(
      (await apiClient.get("/crop-category/", { params })).data,
      normalizeCategory,
    ),
  detail: async (id) =>
    normalizeCategory(
      unwrapRecord((await apiClient.get(`/crop-category/${id}`)).data),
    ),
  create: async (payload) =>
    normalizeCategory(
      unwrapRecord(
        (await apiClient.post("/crop-category/", payload, jsonConfig())).data,
      ),
    ),
  update: async (id, payload) =>
    normalizeCategory(
      unwrapRecord(
        (await apiClient.put(`/crop-category/${id}`, payload, jsonConfig()))
          .data,
      ),
    ),
  toggleDelete: async (id) =>
    (await apiClient.patch(`/crop-category/toggle-delete/${id}`)).data,
};

export const cropsApi = {
  list: async (params = {}) =>
    listResult(
      (await apiClient.get("/crops/getAll-crop", { params })).data,
      normalizeCrop,
    ),
  detail: async (id) => {
    const crops = await cropsApi.list({ limit: 100 });
    return crops.find((crop) => String(crop.id) === String(id)) || null;
  },
  create: async (payload) =>
    normalizeCrop(
      unwrapRecord(
        (
          await apiClient.post(
            "/crops/create-crop",
            toFormData(payload, ["crop_theme_image"]),
            formConfig(),
          )
        ).data,
      ),
    ),
  update: async (id, payload) =>
    normalizeCrop(
      unwrapRecord(
        (
          await apiClient.put(
            `/crops/update-crop/${id}`,
            toFormData(payload, ["crop_theme_image"]),
            formConfig(),
          )
        ).data,
      ),
    ),
  toggleStatus: async (id) =>
    (await apiClient.put(`/crops/toggle-crop-status/${id}`)).data,
};

export const cropDetailsApi = {
  list: async (params = {}) =>
    listResult(
      (await apiClient.get("/crops_details/getAll-crop-detail", { params }))
        .data,
      normalizeCropDetail,
    ),
  create: async (payload) =>
    normalizeCropDetail(
      unwrapRecord(
        (
          await apiClient.post(
            "/crops_details/create-crop-detail",
            toFormData(payload, ["crop_details_theme_image"]),
            formConfig(),
          )
        ).data,
      ),
    ),
  update: async (id, payload) =>
    normalizeCropDetail(
      unwrapRecord(
        (
          await apiClient.put(
            `/crops_details/update-crop-details/${id}`,
            toFormData(payload, ["crop_details_theme_image"]),
            formConfig(),
          )
        ).data,
      ),
    ),
  toggleStatus: async (id) =>
    (await apiClient.put(`/crops_details/toggle-crop-detail-status/${id}`))
      .data,
  updateImages: async (id, payload) =>
    normalizeCropDetail(
      unwrapRecord(
        (
          await apiClient.put(
            `/crops_details/update-crop-detail-images/${id}`,
            toFormData(payload, ["crop_details_theme_image"]),
            formConfig(),
          )
        ).data,
      ),
    ),
};

export const cropDiseaseApi = {
  list: async (params = {}) =>
    listResult(
      (await apiClient.get("/crop-disease/", { params })).data,
      normalizeCropDisease,
    ),
  detail: async (id) =>
    normalizeCropDisease(
      unwrapRecord((await apiClient.get(`/crop-disease/${id}`)).data),
    ),
  create: async (payload) =>
    normalizeCropDisease(
      unwrapRecord(
        (
          await apiClient.post(
            "/crop-disease/",
            cropDiseaseFormData(payload),
            formConfig(),
          )
        ).data,
      ),
    ),
  update: async (id, payload) =>
    normalizeCropDisease(
      unwrapRecord(
        (
          await apiClient.put(
            `/crop-disease/${id}`,
            cropDiseaseFormData(payload),
            formConfig(),
          )
        ).data,
      ),
    ),
  remove: async (id) => (await apiClient.delete(`/crop-disease/${id}`)).data,
};

export const guideHeadingsApi = {
  list: async () =>
    listResult(
      (await apiClient.get("/crops_guid_heading/heading")).data,
      normalizeHeading,
    ),
  detail: async (id) =>
    normalizeHeading(
      unwrapRecord(
        (await apiClient.get(`/crops_guid_heading/heading/${id}`)).data,
      ),
    ),
  create: async (payload) =>
    normalizeHeading(
      unwrapRecord(
        (
          await apiClient.post(
            "/crops_guid_heading/heading",
            {
              title: payload.title,
              title_hi: payload.title_hi ?? null,
            },
            jsonConfig(),
          )
        ).data,
      ),
    ),
  update: async (id, payload) =>
    normalizeHeading(
      unwrapRecord(
        (
          await apiClient.put(
            `/crops_guid_heading/heading/${id}`,
            {
              title: payload.title,
              title_hi: payload.title_hi ?? null,
            },
            jsonConfig(),
          )
        ).data,
      ),
    ),
  remove: async (id) =>
    (await apiClient.patch(`/crops_guid_heading/heading/delete/${id}`)).data,
  restore: async (id) =>
    (await apiClient.patch(`/crops_guid_heading/heading/restore/${id}`)).data,
};

export const guideDetailsApi = {
  list: async () =>
    normalizeGuideDetailsResponse(
      (await apiClient.get("/crop_guid_details/detail")).data,
    ),
  byCrop: async (cropId) =>
    normalizeGuideDetailsResponse(
      (await apiClient.get(`/crop_guid_details/detail/${cropId}`)).data,
    ),
  create: async (payload) => {
    const formData = new FormData();
    formData.append("crops_guid_heading_id", payload.crops_guid_heading_id);
    formData.append("crop_id", payload.crop_id);
    formData.append(
      "details",
      typeof payload.details === "string"
        ? payload.details
        : JSON.stringify(payload.details || []),
    );
    (payload.media || []).forEach((files, index) => {
      appendFiles(formData, `media_${index}`, files);
    });
    return normalizeGuideDetailsResponse(
      (
        await apiClient.post(
          "/crop_guid_details/detail",
          formData,
          formConfig(),
        )
      ).data,
    );
  },
  update: async (id, payload) =>
    normalizeGuideDetail(
      unwrapRecord(
        (
          await apiClient.put(
            `/crop_guid_details/detail/${id}`,
            payload,
            jsonConfig(),
          )
        ).data,
      ),
    ),
  appendMedia: async (id, files = []) => {
    const formData = new FormData();
    appendFiles(formData, "media", files);
    return normalizeGuideDetail(
      unwrapRecord(
        (
          await apiClient.post(
            `/crop_guid_details/detail/${id}/media`,
            formData,
            formConfig(),
          )
        ).data,
      ),
    );
  },
  removeMedia: async (detailId, index) =>
    normalizeGuideDetail(
      unwrapRecord(
        (
          await apiClient.delete(
            `/crop_guid_details/detail/media/${detailId}/${index}`,
          )
        ).data,
      ),
    ),
  remove: async (id) =>
    (await apiClient.patch(`/crop_guid_details/detail/delete/${id}`)).data,
};

export const categoriesApi = {
  list: cropCategoriesApi.list,
  detail: cropCategoriesApi.detail,
  create: async (payload) =>
    cropCategoriesApi.create({
      cropCategory: payload.cropCategory ?? payload.name,
      cropCategory_hi: payload.cropCategory_hi ?? payload.name_hi ?? null,
    }),
  update: async (id, payload) =>
    cropCategoriesApi.update(id, {
      cropCategory: payload.cropCategory ?? payload.name,
      cropCategory_hi: payload.cropCategory_hi ?? payload.name_hi ?? null,
    }),
  remove: cropCategoriesApi.toggleDelete,
};

export const productsApi = {
  list: cropsApi.list,
  detail: cropsApi.detail,
  create: async (payload) =>
    cropsApi.create({
      name: payload.name,
      name_hi: payload.name_hi ?? null,
      description: payload.description,
      description_hi: payload.description_hi ?? null,
      crop_category_id: payload.crop_category_id ?? payload.categoryId,
      crop_theme_image: payload.crop_theme_image,
    }),
  update: async (id, payload) =>
    cropsApi.update(id, {
      name: payload.name,
      name_hi: payload.name_hi ?? null,
      description: payload.description,
      description_hi: payload.description_hi ?? null,
      crop_category_id: payload.crop_category_id ?? payload.categoryId,
      crop_theme_image: payload.crop_theme_image,
    }),
  remove: cropsApi.toggleStatus,
};

export const analyticsApi = {
  overview: async (role) =>
    (await apiClient.get("/analytics/overview", { params: { role } })).data,
};

export const usersApi = {
  list: async (params = {}) =>
    listResult(
      (await apiClient.get("/users", {
        params: {
          ...params,
          role: params.role ? toApiRole(params.role) : undefined,
        },
      })).data,
      normalizeUser,
    ),
  create: async (payload) =>
    normalizeUser(unwrapRecord((await apiClient.post("/users", payload)).data)),
  update: async (id, payload) =>
    normalizeUser(unwrapRecord((await apiClient.put(`/users/${id}`, payload)).data)),
  updateRole: async (id, role) =>
    (await apiClient.patch(`/users/role/${id}`, { role: toApiRole(role) }, jsonConfig())).data,
  toggleStatus: async (id) =>
    (await apiClient.patch(`/users/toggle-status/${id}`)).data,
  remove: async (id) => (await apiClient.delete(`/users/${id}`)).data,
};

export const queriesApi = {
  list: async (params = {}) =>
    (await apiClient.get("/queries", { params })).data,
  detail: async (id) => (await apiClient.get(`/queries/${id}`)).data,
  update: async (id, payload) =>
    (await apiClient.put(`/queries/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/queries/${id}`)).data,
};

export const recommendationsApi = {
  list: async () => (await apiClient.get("/recommendations")).data,
  create: async (payload) =>
    (await apiClient.post("/recommendations", payload)).data,
};

export const ordersApi = {
  list: async (params = {}) =>
    (await apiClient.get("/orders", { params })).data,
  update: async (id, payload) =>
    (await apiClient.put(`/orders/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/orders/${id}`)).data,
};

export const escalationsApi = {
  list: async (params = {}) =>
    (await apiClient.get("/escalations", { params })).data,
  update: async (id, payload) =>
    (await apiClient.put(`/escalations/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/escalations/${id}`)).data,
};

export const notificationsApi = {
  list: async (params = {}) =>
    (await apiClient.get("/notifications", { params })).data,
  markRead: async (id) =>
    (await apiClient.patch(`/notifications/${id}/read`)).data,
};

export const auditApi = {
  list: async () => (await apiClient.get("/audit-logs")).data,
  remove: async (id) => (await apiClient.delete(`/audit-logs/${id}`)).data,
};

export const tasksApi = {
  list: async (params = {}) => (await apiClient.get("/tasks", { params })).data,
  update: async (id, payload) =>
    (await apiClient.put(`/tasks/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/tasks/${id}`)).data,
};

export const supportCasesApi = {
  list: async () => (await apiClient.get("/support-cases")).data,
  update: async (id, payload) =>
    (await apiClient.put(`/support-cases/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/support-cases/${id}`)).data,
};

export const settingsApi = {
  get: async () => (await apiClient.get("/settings")).data,
  update: async (payload) => (await apiClient.put("/settings", payload)).data,
};

export const demoApi = {
  reset: async () => (await apiClient.post("/demo/reset")).data,
};
