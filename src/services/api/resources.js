import { API_BASE_URL, apiClient } from "@/services/api/client";

function unwrapList(response, keys = ["data", "categories", "subcategories", "vendorCategories", "productCategories", "cropCategories", "users", "cropDetails", "cropDiseases", "diseases"]) {
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
      source.total_records ??
      source.count ??
      unwrapList(response).length,
    page: source.page ?? 1,
    limit: source.limit,
    totalPages: source.totalPages ?? source.total_pages ?? 1,
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

function toBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["1", "true", "yes", "deleted", "disabled"].includes(value.trim().toLowerCase());
  }
  return false;
}

function isDeletedRecord(...values) {
  return values.some((value) => toBooleanFlag(value));
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
    toBooleanFlag(deleteFlag) ||
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
  const isDeleted = isDeletedRecord(
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
  const isDeleted = isDeletedRecord(
    english.is_delete ?? record?.is_delete ?? hindi.is_delete,
  );
  return {
    ...record,
    id: english.id ?? record?.id,
    name: firstPresent(english.name, record?.name),
    name_hi: firstPresent(hindi.name, record?.name_hi, record?.hindi_name, record?.name_hindi),
    description: firstPresent(english.description, english.decription, record?.description, record?.decription),
    description_hi: firstPresent(
      hindi.description,
      hindi.decription,
      record?.description_hi,
      record?.decription_hi,
      record?.hindi_description,
      record?.description_hindi,
    ),
    categoryId:
      english.crop_category_id ?? record?.crop_category_id ?? category.id,
    categoryName:
      (typeof category === "string" ? category : category.name) ??
      record?.categoryName ??
      record?.category,
    images: normalizeMedia(
      firstPresent(english.crop_theme_image, english.image, record?.crop_theme_image, record?.image),
    ),
    image: normalizeAssetUrl(
      firstPresent(english.crop_theme_image, english.image, record?.crop_theme_image, record?.image),
    ),
    crop_theme_image_id: firstPresent(english.crop_theme_image_id, record?.crop_theme_image_id, []),
    sequence: english.sequence ?? record?.sequence,
    sku: record?.sku ?? `CROP-${english.id ?? record?.id ?? ""}`,
    price: record?.price ?? 0,
    stock: record?.stock ?? 0,
    is_delete: isDeleted,
    status: isDeleted ? "deleted" : "active",
    createdAt: english.createdAt ?? english.created_at ?? record?.createdAt,
    updatedAt: english.updatedAt ?? english.updated_at ?? record?.updatedAt,
  };
}

function normalizeCropDisease(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = isDeletedRecord(
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

function normalizeCheckoutResponse(response) {
  const source = unwrapRecord(response) || response || {};
  const order = normalizeOrder(source.order || source.data?.order || source);
  return {
    ...source,
    ...order,
    id: firstPresent(order.id, source.orderId, source.order_id),
    orderId: firstPresent(source.orderId, source.order_id, order.id),
    order_id: firstPresent(source.order_id, source.orderId, order.id),
    totalAmount: Number(firstPresent(source.totalAmount, source.total_amount, order.totalAmount, order.total, 0)),
    total_amount: Number(firstPresent(source.total_amount, source.totalAmount, order.totalAmount, order.total, 0)),
    paymentUrl: firstPresent(source.paymentUrl, source.payment_url, source.data?.paymentUrl, source.data?.payment_url),
    payment_url: firstPresent(source.payment_url, source.paymentUrl, source.data?.payment_url, source.data?.paymentUrl),
    message: source.message,
    success: source.success,
  };
}

function inferMediaType(item, url = "") {
  const explicitType = typeof item === "object" ? item?.type || item?.resource_type : "";
  if (explicitType) return String(explicitType).toLowerCase();
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ? "video" : "image";
}

function normalizeQueryMedia(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeQueryMedia(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      return normalizeQueryMedia(JSON.parse(value));
    } catch {
      const url = normalizeAssetUrl(value);
      return url ? [{ url, type: inferMediaType(null, url) }] : [];
    }
  }
  if (typeof value === "object") {
    const url = normalizeAssetUrl(
      firstPresent(
        value.secure_url,
        value.secureUrl,
        value.url,
        value.media_url,
        value.image_url,
        value.file_url,
        value.path,
        value.file_path,
      ),
    );
    return url
      ? [
          {
            ...value,
            url,
            type: inferMediaType(value, url),
            public_id: value.public_id ?? value.publicId,
            original_name: value.original_name ?? value.originalName ?? value.name,
          },
        ]
      : [];
  }
  return [];
}

function normalizeQueryReply(record) {
  const source = unwrapRecord(record) || {};
  const id = firstPresent(source.reply_id, source.id, source._id);
  const repliedAt = firstPresent(source.replied_at, source.created_at, source.createdAt);
  const repliedBy = firstPresent(source.replied_by, source.responder_name, source.username);

  return {
    ...source,
    id,
    reply_id: id,
    replyText: firstPresent(source.reply_text, source.replyText, source.text),
    reply_text: firstPresent(source.reply_text, source.replyText, source.text),
    media: normalizeQueryMedia(firstPresent(source.media_url, source.reply_media, source.media)),
    media_url: normalizeQueryMedia(firstPresent(source.media_url, source.reply_media, source.media)),
    responderType: firstPresent(source.responder_type, source.responderRole, source.responder_role),
    responder_type: firstPresent(source.responder_type, source.responderRole, source.responder_role),
    repliedBy,
    replied_by: repliedBy,
    responderAvatar: normalizedProfileImage(source.responder_avatar, source.avatar, source.profile_image),
    responder_avatar: normalizedProfileImage(source.responder_avatar, source.avatar, source.profile_image),
    createdAt: repliedAt,
    created_at: repliedAt,
    repliedAt,
    replied_at: repliedAt,
  };
}

function normalizeQuery(record) {
  const source = unwrapRecord(record) || {};
  const id = firstPresent(source.id, source.query_id, source._id);
  const cropName = firstPresent(source.crop_name, source.cropName, source.crop);
  const askedBy = firstPresent(source.asked_by, source.farmerName, source.username, source.user_name);
  const createdAt = firstPresent(source.created_at, source.createdAt, source.query_created_at);
  const confirmedAt = firstPresent(source.confirmed_at, source.confirmedAt);
  const replyCount = Number(firstPresent(source.reply_count, source.total_replies, source.replyCount, 0));
  const media = normalizeQueryMedia(firstPresent(source.media_url, source.media, source.files));
  const queryText = firstPresent(source.query_text, source.queryText, source.description, source.issueType);

  return {
    ...source,
    id,
    query_id: id,
    queryText,
    query_text: queryText,
    media,
    media_url: media,
    mediaType: firstPresent(source.media_type, source.mediaType, media.length ? "mixed" : "none"),
    media_type: firstPresent(source.media_type, source.mediaType, media.length ? "mixed" : "none"),
    status: String(source.status || "pending").toLowerCase(),
    cropId: firstPresent(source.crop_id, source.cropId),
    crop_id: firstPresent(source.crop_id, source.cropId),
    cropName,
    crop_name: cropName,
    cropNameHi: firstPresent(source.crop_name_hi, source.cropNameHi),
    crop_name_hi: firstPresent(source.crop_name_hi, source.cropNameHi),
    cropThemeImage: normalizeAssetUrl(firstPresent(source.crop_theme_image, source.cropThemeImage)),
    crop_theme_image: normalizeAssetUrl(firstPresent(source.crop_theme_image, source.cropThemeImage)),
    askedBy,
    asked_by: askedBy,
    farmerName: askedBy || "Unknown user",
    userId: firstPresent(source.user_id, source.userId),
    user_id: firstPresent(source.user_id, source.userId),
    userPhone: firstPresent(source.user_phone, source.userPhone),
    user_phone: firstPresent(source.user_phone, source.userPhone),
    userAvatar: normalizedProfileImage(source.user_avatar, source.profile_image, source.avatar),
    user_avatar: normalizedProfileImage(source.user_avatar, source.profile_image, source.avatar),
    replyCount,
    reply_count: replyCount,
    totalReplies: Number(firstPresent(source.total_replies, source.reply_count, source.totalReplies, replyCount)),
    createdAt,
    created_at: createdAt,
    confirmedAt,
    confirmed_at: confirmedAt,
    issueType: queryText,
    crop: cropName,
    priority: source.priority || (String(source.status).toLowerCase() === "pending" ? "pending" : "confirmed"),
    replies: (source.replies || []).map(normalizeQueryReply),
  };
}

function normalizeQueryDetail(response) {
  return normalizeQuery(unwrapRecord(response));
}

function normalizeStaffReply(record) {
  const source = unwrapRecord(record) || {};
  const query = normalizeQuery({
    id: source.query_id,
    query_text: source.query_text,
    status: source.query_status,
    created_at: source.query_created_at,
    asked_by: source.asked_by,
    user_avatar: source.user_avatar,
    crop_name: source.crop_name,
  });
  const reply = normalizeQueryReply(source);

  return {
    ...source,
    ...reply,
    query,
    queryId: query.id,
    query_id: query.id,
    queryText: query.queryText,
    query_text: query.queryText,
    queryStatus: query.status,
    query_status: query.status,
    cropName: query.cropName,
    crop_name: query.cropName,
    askedBy: query.askedBy,
    asked_by: query.askedBy,
  };
}

function normalizeAdminQueryDetail(response) {
  const source = unwrapRecord(response) || {};
  const query = normalizeQuery(source.query || source);
  return {
    ...source,
    query,
    replies: (source.replies || query.replies || []).map(normalizeQueryReply),
    statusHistory: source.status_history || source.statusHistory || [],
    status_history: source.status_history || source.statusHistory || [],
  };
}

function normalizeUserActivity(response) {
  const source = unwrapRecord(response) || {};
  return {
    ...source,
    user: source.user ? normalizeUser(source.user) : null,
    queriesMade: (source.queries_made || source.queriesMade || []).map(normalizeQuery),
    queries_made: (source.queries_made || source.queriesMade || []).map(normalizeQuery),
    repliesGiven: (source.replies_given || source.repliesGiven || []).map(normalizeStaffReply),
    replies_given: (source.replies_given || source.repliesGiven || []).map(normalizeStaffReply),
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

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [value].filter(Boolean);
}

function normalizeShopProduct(record) {
  const source = unwrapRecord(record) || {};
  const visibleSource = { ...source };
  delete visibleSource.sku;
  delete visibleSource.product_code;
  const rawStatus = String(firstPresent(source.status, source.product_status, "")).toLowerCase();
  const hasApprovalValue =
    firstPresent(source.is_approved, source.isApproved, source.approved) !== undefined;
  const isApproved = hasApprovalValue
    ? toBooleanFlag(firstPresent(source.is_approved, source.isApproved, source.approved))
    : ["approved", "published", "active"].includes(rawStatus);
  const status = rawStatus === "deleted"
    ? "deleted"
    : firstPresent(
        hasApprovalValue ? (isApproved ? "approved" : "pending_review") : undefined,
        rawStatus,
        "published",
      );
  return {
    ...visibleSource,
    id: firstPresent(source.id, source.product_id, source.productId, source._id),
    vendorId: firstPresent(source.vendor_id, source.vendorId),
    vendor_id: firstPresent(source.vendor_id, source.vendorId),
    name: firstPresent(source.name, source.product_name, source.title),
    description: firstPresent(source.description, source.product_description, ""),
    price: Number(firstPresent(source.price, source.amount, 0)),
    mrp: Number(firstPresent(source.mrp, source.maximum_retail_price, source.price, 0)),
    vendor_price: Number(firstPresent(source.vendor_price, source.vendorPrice, source.price, 0)),
    vendorPrice: Number(firstPresent(source.vendorPrice, source.vendor_price, source.price, 0)),
    stock: Number(firstPresent(source.stock, source.quantity, 0)),
    image_url: normalizeAssetUrl(firstPresent(source.image_url, source.imageUrl, source.image, source.thumbnail)),
    image: normalizeAssetUrl(firstPresent(source.image, source.image_url, source.imageUrl, source.thumbnail)),
    images: normalizeMedia(firstPresent(source.images, source.product_images, source.image, source.image_url)),
    retained_images: firstPresent(source.retained_images, source.images, source.product_images, []),
    tags: parseJsonArray(firstPresent(source.tags, source.categories, source.category)),
    category_id: firstPresent(source.category_id, source.categoryId),
    categoryId: firstPresent(source.categoryId, source.category_id),
    categoryName: firstPresent(source.categoryName, source.category_name, source.category?.name, source.category?.english?.name),
    category_name: firstPresent(source.category_name, source.categoryName, source.category?.name, source.category?.english?.name),
    sub_category_id: firstPresent(source.sub_category_id, source.subCategoryId),
    subCategoryId: firstPresent(source.subCategoryId, source.sub_category_id),
    subCategoryName: firstPresent(source.subCategoryName, source.sub_category_name, source.subcategory?.name, source.subcategory?.english?.name),
    sub_category_name: firstPresent(source.sub_category_name, source.subCategoryName, source.subcategory?.name, source.subcategory?.english?.name),
    product_type: firstPresent(source.product_type, source.productType, source.type),
    productType: firstPresent(source.productType, source.product_type, source.type),
    is_approved: isApproved,
    isApproved,
    approvalStatus: isApproved ? "approved" : "pending_review",
    status,
    company_name: firstPresent(source.company_name, source.companyName, source.vendor_name),
    companyName: firstPresent(source.companyName, source.company_name, source.vendor_name),
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeTaxonomyCategory(record) {
  const source = unwrapRecord(record) || {};
  const english = localized(source);
  const hindi = localized(source, "hindi");
  const isDeleted = isDeletedRecord(firstPresent(source.is_delete, english.is_delete, hindi.is_delete, false));
  return {
    ...source,
    id: firstPresent(source.id, english.id),
    name: firstPresent(source.name, english.name),
    name_hi: firstPresent(source.name_hi, source.hindi_name, hindi.name),
    category_id: firstPresent(source.category_id, source.categoryId),
    categoryId: firstPresent(source.categoryId, source.category_id),
    category_name: firstPresent(source.category_name, source.categoryName),
    categoryName: firstPresent(source.categoryName, source.category_name),
    image: normalizeAssetUrl(firstPresent(source.image, source.image_url, source.imageUrl, english.image)),
    image_url: normalizeAssetUrl(firstPresent(source.image_url, source.imageUrl, source.image, english.image)),
    sub_category_required: toBooleanFlag(firstPresent(source.sub_category_required, source.subCategoryRequired, false)),
    allowed_services: firstPresent(source.allowed_services, source.allowedServices, "product_only"),
    status: isDeleted ? "deleted" : String(firstPresent(source.status, "active")).toLowerCase(),
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeAddress(record) {
  const source = unwrapRecord(record) || {};
  return {
    ...source,
    id: firstPresent(source.id, source.address_id, source._id),
    name: firstPresent(source.name, source.full_name, source.recipient_name),
    phone: firstPresent(source.phone, source.mobile_number, source.mobile),
    address_line: firstPresent(source.address_line, source.addressLine, source.line1, source.address),
    city: source.city || "",
    state: source.state || "",
    zip_code: firstPresent(source.zip_code, source.zipCode, source.pincode, source.postal_code),
  };
}

function checkoutPayload(payload = {}) {
  const address = payload.shippingAddress || {};
  return {
    cartItems: (payload.cartItems || []).map((item) => ({
      productId: item.productId ?? item.product_id,
      quantity: Number(item.quantity || 0),
    })),
    paymentMethod: payload.paymentMethod || "Online",
    shippingAddress: {
      name: address.name || "",
      phone: address.phone || "",
      address_line: address.address_line || address.addressLine || address.address || "",
      city: address.city || "",
      state: address.state || "",
      zip_code: address.zip_code || address.zipCode || address.pincode || "",
    },
  };
}

function normalizeOrder(record) {
  const unwrapped = unwrapRecord(record) || {};
  const source = unwrapped.order || unwrapped;
  const id = firstPresent(source.id, source.order_id, source.orderId);
  const total = Number(firstPresent(source.total, source.total_amount, source.totalAmount, 0));
  const orderStatus = String(firstPresent(source.orderStatus, source.order_status, source.fulfillmentStatus, source.fulfillment_status, source.status, "Pending"));
  return {
    ...source,
    id,
    order_id: id,
    vendorId: firstPresent(source.vendorId, source.vendor_id),
    vendor_id: firstPresent(source.vendor_id, source.vendorId),
    customerName: firstPresent(source.customerName, source.customer_name, source.name, source.username, "Customer"),
    customer_name: firstPresent(source.customer_name, source.customerName, source.name, source.username, "Customer"),
    productName: firstPresent(source.productName, source.product_name),
    product_name: firstPresent(source.product_name, source.productName),
    quantity: Number(firstPresent(source.quantity, 0)),
    price: Number(firstPresent(source.price, source.unit_price, 0)),
    total,
    total_amount: total,
    totalAmount: total,
    payment_method: firstPresent(source.payment_method, source.paymentMethod),
    paymentMethod: firstPresent(source.paymentMethod, source.payment_method),
    phonepe_transaction_id: firstPresent(source.phonepe_transaction_id, source.phonepeTransactionId, source.transaction_id),
    phonepeTransactionId: firstPresent(source.phonepeTransactionId, source.phonepe_transaction_id, source.transaction_id),
    paymentStatus: String(firstPresent(source.paymentStatus, source.payment_status, source.payment, "pending")).toLowerCase(),
    payment_status: firstPresent(source.payment_status, source.paymentStatus, "Pending"),
    fulfillmentStatus: orderStatus.toLowerCase(),
    orderStatus,
    order_status: orderStatus,
    items: source.items || source.cartItems || source.products || [],
    createdAt: firstPresent(source.createdAt, source.created_at, source.order_date),
    created_at: firstPresent(source.created_at, source.createdAt, source.order_date),
    dispatchAt: firstPresent(source.dispatchAt, source.dispatch_at),
  };
}

function normalizeReturnRequest(record) {
  const source = unwrapRecord(record) || {};
  const id = firstPresent(source.id, source.return_id, source.returnRequestId);
  return {
    ...source,
    id,
    return_id: id,
    orderId: firstPresent(source.orderId, source.order_id),
    order_id: firstPresent(source.order_id, source.orderId),
    orderItemId: firstPresent(source.orderItemId, source.order_item_id),
    order_item_id: firstPresent(source.order_item_id, source.orderItemId),
    productName: firstPresent(source.productName, source.product_name, source.name),
    product_name: firstPresent(source.product_name, source.productName, source.name),
    vendorId: firstPresent(source.vendorId, source.vendor_id),
    vendor_id: firstPresent(source.vendor_id, source.vendorId),
    userId: firstPresent(source.userId, source.user_id),
    user_id: firstPresent(source.user_id, source.userId),
    quantity: Number(firstPresent(source.quantity, 0)),
    reason: firstPresent(source.reason, source.return_reason, ""),
    status: String(firstPresent(source.status, "Pending")),
    images: normalizeMedia(firstPresent(source.parsed_images, source.images, source.files, source.media)),
    parsed_images: normalizeMedia(firstPresent(source.parsed_images, source.images, source.files, source.media)),
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeSalesReportRow(record) {
  const source = unwrapRecord(record) || {};
  const orderId = firstPresent(source.order_id, source.orderId, source.id);
  const quantity = Number(firstPresent(source.quantity, source.total_quantity, 0));
  const price = Number(firstPresent(source.price, source.unit_price, 0));
  const itemTotal = Number(firstPresent(source.item_total, source.itemTotal, source.lineTotal, quantity * price, 0));

  return {
    ...source,
    id: firstPresent(source.id, orderId),
    order_id: orderId,
    orderId,
    createdAt: firstPresent(source.createdAt, source.created_at, source.order_date),
    created_at: firstPresent(source.created_at, source.createdAt, source.order_date),
    paymentStatus: String(firstPresent(source.paymentStatus, source.payment_status, "pending")).toLowerCase(),
    payment_status: firstPresent(source.payment_status, source.paymentStatus, "Pending"),
    orderStatus: String(firstPresent(source.orderStatus, source.order_status, source.status, "Pending")),
    order_status: String(firstPresent(source.order_status, source.orderStatus, source.status, "Pending")),
    quantity,
    price,
    item_total: itemTotal,
    itemTotal,
    productName: firstPresent(source.productName, source.product_name, source.name),
    product_name: firstPresent(source.product_name, source.productName, source.name),
    vendorName: firstPresent(source.vendorName, source.vendor_name, source.company_name),
    vendor_name: firstPresent(source.vendor_name, source.vendorName, source.company_name),
    customerName: firstPresent(source.customerName, source.customer_name, source.username),
    customer_name: firstPresent(source.customer_name, source.customerName, source.username),
    vendorId: firstPresent(source.vendorId, source.vendor_id),
    vendor_id: firstPresent(source.vendor_id, source.vendorId),
  };
}

function normalizeVendorProfile(record) {
  const source = unwrapRecord(record) || {};
  return {
    ...source,
    id: firstPresent(source.id, source.vendor_id, source.vendorId),
    userId: firstPresent(source.userId, source.user_id),
    user_id: firstPresent(source.user_id, source.userId),
    full_name: firstPresent(source.full_name, source.fullName, source.name),
    company_name: firstPresent(source.company_name, source.companyName, source.company),
    mobile_number: firstPresent(source.mobile_number, source.mobileNumber, source.phone),
    vendor_type: firstPresent(source.vendor_type, source.vendorType),
    categories: parseJsonArray(source.categories),
    status: String(firstPresent(source.status, "Active")),
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeVendorRegistration(response) {
  const source = unwrapRecord(response) || {};
  const user = source.user || response?.user;
  return {
    ...source,
    ...normalizeVendorProfile(source),
    user: user ? normalizeUser(user) : null,
  };
}

function normalizeSalesReport(response) {
  const source = unwrapRecord(response) || {};
  const rawRows = Array.isArray(source)
    ? source
    : Array.isArray(source.data)
      ? source.data
      : Array.isArray(response?.data)
        ? response.data
        : unwrapList(response);
  const rows = rawRows.map(normalizeSalesReportRow);
  const computedTotal = rows.reduce((sum, row) => sum + Number(row.itemTotal || 0), 0);
  const totalAmount = Number(firstPresent(source.totalAmount, source.total_amount, source.total_earnings, source.totalEarnings, computedTotal, 0));
  const totalItemsSold = rows.reduce((sum, row) => sum + Number(firstPresent(row.quantity, row.total_quantity, 0)), 0);
  const orderIds = new Set(rows.map((row) => row.order_id || row.orderId).filter(Boolean));
  return {
    ...source,
    rows,
    data: rows,
    totalAmount,
    total_amount: totalAmount,
    total_earnings: Number(firstPresent(source.total_earnings, source.totalEarnings, source.revenue, totalAmount)),
    totalEarnings: Number(firstPresent(source.totalEarnings, source.total_earnings, source.revenue, totalAmount)),
    total_orders: Number(firstPresent(source.total_orders, source.totalOrders, source.orders, orderIds.size || rows.length)),
    totalOrders: Number(firstPresent(source.totalOrders, source.total_orders, source.orders, orderIds.size || rows.length)),
    total_items_sold: Number(firstPresent(source.total_items_sold, source.totalItemsSold, source.itemsSold, totalItemsSold)),
    totalItemsSold: Number(firstPresent(source.totalItemsSold, source.total_items_sold, source.itemsSold, totalItemsSold)),
  };
}

function normalizeMandiRate(record) {
  const source = unwrapRecord(record) || {};
  const minPrice = Number(firstPresent(source.min_price, source.minPrice, 0));
  const maxPrice = Number(firstPresent(source.max_price, source.maxPrice, 0));
  const modalPrice = Number(firstPresent(source.total_modal, source.totalModal, source.modal_price, source.average_price, 0));
  return {
    ...source,
    id: firstPresent(source.id, source.mandi_id, source.rate_id),
    crop_id: firstPresent(source.crop_id, source.cropId),
    cropId: firstPresent(source.cropId, source.crop_id),
    crop_name: firstPresent(source.crop_name, source.cropName, source.name),
    cropName: firstPresent(source.cropName, source.crop_name, source.name),
    crop_name_hi: firstPresent(source.crop_name_hi, source.cropNameHi, source.name_hi),
    cropNameHi: firstPresent(source.cropNameHi, source.crop_name_hi, source.name_hi),
    record_date: firstPresent(source.record_date, source.recordDate, source.date),
    recordDate: firstPresent(source.recordDate, source.record_date, source.date),
    min_price: minPrice,
    minPrice,
    max_price: maxPrice,
    maxPrice,
    total_modal: modalPrice,
    totalModal: modalPrice,
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeSettlement(record) {
  const source = unwrapRecord(record) || {};
  return {
    ...source,
    id: firstPresent(source.id, source.settlement_id),
    vendorId: firstPresent(source.vendorId, source.vendor_id),
    vendor_id: firstPresent(source.vendor_id, source.vendorId),
    vendorName: firstPresent(source.vendorName, source.vendor_name, source.company_name),
    vendor_name: firstPresent(source.vendor_name, source.vendorName, source.company_name),
    amount: Number(firstPresent(source.amount, source.settlement_amount, 0)),
    remark: firstPresent(source.remark, source.notes, ""),
    proof_image: normalizeAssetUrl(firstPresent(source.proof_image, source.proofImage, source.image)),
    proofImage: normalizeAssetUrl(firstPresent(source.proofImage, source.proof_image, source.image)),
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeGuideParent(record) {
  const source = unwrapRecord(record) || {};
  const isDeleted = isDeletedRecord(source.is_delete, source.isDelete);
  return {
    ...source,
    id: firstPresent(source.id, source.parent_id),
    crops_guid_heading_id: firstPresent(source.crops_guid_heading_id, source.heading_id, source.headingId),
    headingId: firstPresent(source.headingId, source.heading_id, source.crops_guid_heading_id),
    crop_id: firstPresent(source.crop_id, source.cropId),
    cropId: firstPresent(source.cropId, source.crop_id),
    heading_name: firstPresent(source.heading_name, source.headingName, source.title),
    headingName: firstPresent(source.headingName, source.heading_name, source.title),
    crop_name: firstPresent(source.crop_name, source.cropName, source.name),
    cropName: firstPresent(source.cropName, source.crop_name, source.name),
    status: isDeleted ? "deleted" : String(firstPresent(source.status, "active")).toLowerCase(),
    is_delete: isDeleted,
    createdAt: firstPresent(source.createdAt, source.created_at),
    updatedAt: firstPresent(source.updatedAt, source.updated_at),
  };
}

function normalizeBrokerageLead(record) {
  const source = unwrapRecord(record) || {};
  return {
    ...source,
    id: firstPresent(source.id, source.lead_id, source.leadRequestId),
    categoryName: firstPresent(source.categoryName, source.category_name),
    category_name: firstPresent(source.category_name, source.categoryName),
    userId: firstPresent(source.userId, source.user_id),
    userName: firstPresent(source.userName, source.user_name, source.customer_name, source.username, source.name),
    customerName: firstPresent(source.customerName, source.customer_name, source.userName, source.user_name),
    customerPhone: firstPresent(source.customerPhone, source.customer_phone, source.phone),
    status: String(firstPresent(source.status, "pending")).toLowerCase(),
    createdAt: firstPresent(source.createdAt, source.created_at),
    notes: source.notes || "",
  };
}

function normalizeBrokerageDeal(record) {
  const source = unwrapRecord(record) || {};
  return {
    ...source,
    id: firstPresent(source.id, source.deal_id),
    leadRequestId: firstPresent(source.leadRequestId, source.lead_request_id),
    lead_request_id: firstPresent(source.lead_request_id, source.leadRequestId),
    vendorId: firstPresent(source.vendorId, source.vendor_id),
    vendor_id: firstPresent(source.vendor_id, source.vendorId),
    userId: firstPresent(source.userId, source.user_id),
    user_id: firstPresent(source.user_id, source.userId),
    dealAmount: Number(firstPresent(source.dealAmount, source.deal_amount, 0)),
    deal_amount: Number(firstPresent(source.deal_amount, source.dealAmount, 0)),
    commissionAmount: Number(firstPresent(source.commissionAmount, source.commission_amount, 0)),
    commission_amount: Number(firstPresent(source.commission_amount, source.commissionAmount, 0)),
    status: String(firstPresent(source.status, "logged")).toLowerCase(),
    createdAt: firstPresent(source.createdAt, source.created_at),
  };
}

function normalizeHeading(record) {
  const english = localized(record);
  const hindi = localized(record, "hindi");
  const isDeleted = isDeletedRecord(
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
  const isDeleted = isDeletedRecord(
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

    if (!headings.length) {
      const directDetails = englishCrop.details || cropGroup?.details;
      if (Array.isArray(directDetails) && directDetails.length) {
        return directDetails.map((detail) =>
          normalizeGuideDetail(detail, {
            cropId: englishCrop.crop_id ?? cropGroup?.crop_id,
            cropName: englishCrop.crop_name ?? cropGroup?.crop_name,
            cropName_hi: hindiCrop.crop_name ?? cropGroup?.crop_name_hi,
            headingId: englishCrop.crops_guid_heading_id ?? englishCrop.heading_id ?? cropGroup?.crops_guid_heading_id ?? cropGroup?.heading_id,
            headingName: englishCrop.heading_name ?? englishCrop.heading_title ?? cropGroup?.heading_name,
            headingName_hi: hindiCrop.heading_name ?? hindiCrop.heading_title ?? cropGroup?.heading_name_hi,
          }),
        );
      }

      if (
        firstPresent(
          englishCrop.id,
          englishCrop.detail_id,
          englishCrop.title,
          cropGroup?.id,
          cropGroup?.detail_id,
          cropGroup?.title,
        )
      ) {
        return [
          normalizeGuideDetail(cropGroup, {
            cropId: englishCrop.crop_id ?? cropGroup?.crop_id,
            cropName: englishCrop.crop_name ?? cropGroup?.crop_name,
            cropName_hi: hindiCrop.crop_name ?? cropGroup?.crop_name_hi,
            headingId: englishCrop.crops_guid_heading_id ?? englishCrop.heading_id ?? cropGroup?.crops_guid_heading_id ?? cropGroup?.heading_id,
            headingName: englishCrop.heading_name ?? englishCrop.heading_title ?? cropGroup?.heading_name,
            headingName_hi: hindiCrop.heading_name ?? hindiCrop.heading_title ?? cropGroup?.heading_name_hi,
          }),
        ];
      }
    }

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

function mergeListResults(results, normalizer) {
  const data = results.flatMap((response) => unwrapList(response).map(normalizer));
  const pagination = unwrapPagination(results[0]);
  return Object.assign(data, {
    pagination: pagination
      ? {
          ...pagination,
          page: 1,
          total: pagination.total ?? data.length,
          totalPages: 1,
        }
      : null,
  });
}

async function listAllPages(fetchPage, params = {}, normalizer, { defaultLimit = 100 } = {}) {
  const responses = await collectPaginatedResponses(fetchPage, params, { defaultLimit });

  if (responses.length === 1) {
    return listResult(responses[0], normalizer);
  }

  return mergeListResults(responses, normalizer);
}

async function collectPaginatedResponses(fetchPage, params = {}, { defaultLimit = 100 } = {}) {
  const firstParams = {
    ...params,
    page: params.page ?? 1,
    limit: params.limit ?? defaultLimit,
  };
  const firstResponse = await fetchPage(firstParams);
  const firstPagination = unwrapPagination(firstResponse);

  if (!firstPagination?.totalPages || Number(firstPagination.totalPages) <= Number(firstPagination.page || 1)) {
    return [firstResponse];
  }

  const totalPages = Number(firstPagination.totalPages);
  const responses = [firstResponse];

  for (let page = Number(firstPagination.page || 1) + 1; page <= totalPages; page += 1) {
    responses.push(await fetchPage({ ...firstParams, page }));
  }

  return responses;
}

function mergeGuideDetailsResponses(responses) {
  const normalizedResponses = responses.map(normalizeGuideDetailsResponse);
  const details = normalizedResponses.flatMap((items) => items);
  const groups = normalizedResponses.flatMap((items) => items.groups || []);
  const pagination = unwrapPagination(responses[0]);

  return Object.assign(details, {
    groups,
    pagination: pagination
      ? {
          ...pagination,
          page: 1,
          total: pagination.total ?? details.length,
          totalPages: 1,
        }
      : null,
  });
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

function shopProductFormData(payload = {}) {
  const normalizedPayload = {
    ...payload,
    tags: Array.isArray(payload.tags) ? JSON.stringify(payload.tags) : payload.tags,
    retained_images: Array.isArray(payload.retained_images)
      ? JSON.stringify(payload.retained_images)
      : payload.retained_images,
  };
  delete normalizedPayload.status;
  delete normalizedPayload.vendorId;
  delete normalizedPayload.vendor_id;
  return toFormData(normalizedPayload, ["image"]);
}

function cropImagesFormData(payload = {}) {
  const formData = new FormData();
  appendFiles(formData, "crop_theme_image", payload.crop_theme_image);
  if (payload.deleteIndexes !== undefined && payload.deleteIndexes !== null && payload.deleteIndexes !== "") {
    formData.append(
      "deleteIndexes",
      Array.isArray(payload.deleteIndexes) ? JSON.stringify(payload.deleteIndexes) : payload.deleteIndexes,
    );
  }
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
        toFormData({
          ...payload,
          full_name: payload.full_name ?? payload.username,
        }, ["profile_image"]),
        formConfig(),
      )
    ).data,
  verifyOtp: async (payload) =>
    (await apiClient.post("/auth/verify-otp", payload, jsonConfig())).data,
  resendOtp: async (payload) =>
    (await apiClient.post("/auth/resend", payload, jsonConfig())).data,
  login: async (payload) => {
    return normalizeAuthSession(
      (
        await apiClient.post(
          "/auth/login",
          { phone: payload.phone, password: payload.password },
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
    listAllPages(
      async (pageParams) => (await apiClient.get("/crop-category/", { params: pageParams })).data,
      params,
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
    listAllPages(
      async (pageParams) => (await apiClient.get("/crops/getAll-crop", { params: pageParams })).data,
      params,
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
  updateImages: async (id, payload) =>
    normalizeCrop(
      unwrapRecord(
        (
          await apiClient.put(
            `/crops/update-crop-images/${id}`,
            cropImagesFormData(payload),
            formConfig(),
          )
        ).data,
      ),
    ),
  toggleStatus: async (id) =>
    (await apiClient.put(`/crops/toggle-crop-status/${id}`)).data,
};

export const cropDiseaseApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/crop-disease/", { params: pageParams })).data,
      params,
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
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/crops_guid_heading/heading", { params: pageParams })).data,
      params,
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
  list: async (params = {}) =>
    mergeGuideDetailsResponses(
      await collectPaginatedResponses(
        async (pageParams) => (await apiClient.get("/crop_guid_details/detail", { params: pageParams })).data,
        params,
      ),
    ),
  byCrop: async (cropId, params = {}) =>
    mergeGuideDetailsResponses(
      await collectPaginatedResponses(
        async (pageParams) => (await apiClient.get(`/crop_guid_details/detail/${cropId}`, { params: pageParams })).data,
        params,
      ),
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
      name: payload.name ?? payload.cropCategory,
      name_hi: payload.name_hi ?? payload.cropCategory_hi ?? null,
      cropCategory: payload.cropCategory ?? payload.name,
      cropCategory_hi: payload.cropCategory_hi ?? payload.name_hi ?? null,
    }),
  update: async (id, payload) =>
    cropCategoriesApi.update(id, {
      name: payload.name ?? payload.cropCategory,
      name_hi: payload.name_hi ?? payload.cropCategory_hi ?? null,
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
      description: payload.description ?? payload.decription ?? null,
      description_hi: payload.description_hi ?? payload.decription_hi ?? null,
      crop_category_id: payload.crop_category_id ?? payload.categoryId,
      sequence: payload.sequence ?? null,
      crop_theme_image: payload.crop_theme_image,
    }),
  update: async (id, payload) =>
    cropsApi.update(id, {
      name: payload.name,
      name_hi: payload.name_hi ?? null,
      description: payload.description ?? payload.decription ?? null,
      description_hi: payload.description_hi ?? payload.decription_hi ?? null,
      crop_category_id: payload.crop_category_id ?? payload.categoryId,
      sequence: payload.sequence ?? null,
    }),
  updateImages: cropsApi.updateImages,
  remove: cropsApi.toggleStatus,
};

export const productCategoriesApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/product-categories", { params: pageParams })).data,
      params,
      normalizeTaxonomyCategory,
    ),
  create: async (payload) =>
    normalizeTaxonomyCategory(
      unwrapRecord((await apiClient.post("/product-categories", payload, jsonConfig())).data),
    ),
  update: async (id, payload) =>
    normalizeTaxonomyCategory(
      unwrapRecord((await apiClient.put(`/product-categories/${id}`, payload, jsonConfig())).data),
    ),
  toggleDelete: async (id) =>
    (await apiClient.patch(`/product-categories/toggle-delete/${id}`)).data,
  subcategories: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/product-categories/subcategory", { params: pageParams })).data,
      params,
      normalizeTaxonomyCategory,
    ),
  createSubcategory: async (payload) =>
    normalizeTaxonomyCategory(
      unwrapRecord((await apiClient.post("/product-categories/subcategory", toFormData(payload, ["image"]), formConfig())).data),
    ),
  updateSubcategory: async (id, payload) =>
    normalizeTaxonomyCategory(
      unwrapRecord((await apiClient.put(`/product-categories/subcategory/${id}`, toFormData(payload, ["image"]), formConfig())).data),
    ),
  toggleDeleteSubcategory: async (id) =>
    (await apiClient.patch(`/product-categories/subcategory/toggle-delete/${id}`)).data,
};

export const vendorCategoriesApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/vendor-categories", { params: pageParams })).data,
      params,
      normalizeTaxonomyCategory,
    ),
  create: async (payload) =>
    normalizeTaxonomyCategory(
      unwrapRecord((await apiClient.post("/vendor-categories", payload, jsonConfig())).data),
    ),
  update: async (id, payload) =>
    normalizeTaxonomyCategory(
      unwrapRecord((await apiClient.put(`/vendor-categories/${id}`, payload, jsonConfig())).data),
    ),
  toggleDelete: async (id) =>
    (await apiClient.patch(`/vendor-categories/toggle-delete/${id}`)).data,
};

export const shopProductsApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/products/all", { params: pageParams })).data,
      params,
      normalizeShopProduct,
    ),
  detail: async (id) => {
    const products = await shopProductsApi.list({ limit: 100 });
    return products.find((product) => String(product.id) === String(id)) || null;
  },
  create: async (payload) =>
    normalizeShopProduct(
      unwrapRecord((await apiClient.post("/products/create", shopProductFormData(payload), formConfig())).data),
    ),
  update: async (id, payload) =>
    normalizeShopProduct(
      unwrapRecord((await apiClient.put(`/products/update/${id}`, shopProductFormData(payload), formConfig())).data),
    ),
  remove: async (id) =>
    (await apiClient.delete(`/products/delete/${id}`)).data,
};

export const vendorApi = {
  register: async (payload) =>
    normalizeVendorRegistration(
      (await apiClient.post("/vendor/register", payload, jsonConfig())).data,
    ),
  profile: async () =>
    normalizeVendorProfile((await apiClient.get("/vendor/profile")).data),
  updateProfile: async (id, payload) =>
    normalizeVendorProfile(
      unwrapRecord((await apiClient.put(`/vendor/profile/${id}`, payload, jsonConfig())).data),
    ),
  all: async () =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/vendor/all", { params: pageParams })).data,
      {},
      normalizeVendorProfile,
    ),
  serviceProviders: async () =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/vendor/service-providers", { params: pageParams })).data,
      {},
      normalizeVendorProfile,
    ),
  byCategory: async (categoryId, params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get(`/vendor/getall-vendor-by-category/${categoryId}`, { params: pageParams })).data,
      params,
      normalizeVendorProfile,
    ),
  updateStatus: async (id, status) =>
    (await apiClient.patch(`/vendor/status/${id}`, { status }, jsonConfig())).data,
};

export const addressesApi = {
  list: async () =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/addresses", { params: pageParams })).data,
      {},
      normalizeAddress,
    ),
  create: async (payload) =>
    normalizeAddress(
      unwrapRecord((await apiClient.post("/addresses", payload, jsonConfig())).data),
    ),
  update: async (id, payload) =>
    normalizeAddress(
      unwrapRecord((await apiClient.put(`/addresses/${id}`, payload, jsonConfig())).data),
    ),
  remove: async (id) => (await apiClient.delete(`/addresses/${id}`)).data,
};

export const usersApi = {
  list: async (params = {}) => {
    const requestParams = {
      ...params,
      role: params.role ? toApiRole(params.role) : undefined,
    };
    return listAllPages(
      async (pageParams) => (await apiClient.get("/users", {
        params: {
          ...pageParams,
        },
      })).data,
      requestParams,
      normalizeUser,
    );
  },
  me: async () =>
    normalizeUser(
      unwrapRecord((await apiClient.get("/users/me")).data),
    ),
  updateRole: async (id, role) =>
    (await apiClient.patch(`/users/role/${id}`, { role: toApiRole(role) }, jsonConfig())).data,
  toggleStatus: async (id) =>
    (await apiClient.patch(`/users/toggle-status/${id}`)).data,
};

export const queriesApi = {
  create: async (payload) =>
    unwrapRecord(
      (
        await apiClient.post(
          "/queries",
          toFormData(payload, ["files"]),
        )
      ).data,
    ),
  list: async (params = {}) => queriesApi.adminAll(params),
  myQueries: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/queries/my-queries", { params: pageParams })).data,
      params,
      normalizeQuery,
    ),
  publicFeed: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/queries/public", { params: pageParams })).data,
      params,
      normalizeQuery,
    ),
  detail: async (id) =>
    normalizeQueryDetail((await apiClient.get(`/queries/${id}`)).data),
  staffPending: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/queries/staff/pending", { params: pageParams })).data,
      params,
      normalizeQuery,
    ),
  reply: async (id, payload) =>
    unwrapRecord(
      (
        await apiClient.post(
          `/queries/${id}/reply`,
          toFormData(payload, ["files"]),
        )
      ).data,
    ),
  staffMyReplies: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/queries/staff/my-replies", { params: pageParams })).data,
      params,
      normalizeStaffReply,
    ),
  adminAll: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/queries/admin/all", { params: pageParams })).data,
      params,
      normalizeQuery,
    ),
  adminDetail: async (id) =>
    normalizeAdminQueryDetail((await apiClient.get(`/queries/admin/${id}/detail`)).data),
  adminUserActivity: async (userId) =>
    normalizeUserActivity((await apiClient.get(`/queries/admin/activity/${userId}`)).data),
  update: async (id, payload) =>
    queriesApi.reply(id, { reply_text: payload.reply_text || payload.replyText || payload.actions || payload.summary }),
  remove: async (id) => (await apiClient.delete(`/queries/${id}`)).data,
};

export const ordersApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/orders/history", { params: pageParams })).data,
      params,
      normalizeOrder,
    ),
  myOrders: async () =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/orders/my-orders", { params: pageParams })).data,
      {},
      normalizeOrder,
    ),
  checkout: async (payload) =>
    normalizeCheckoutResponse((await apiClient.post("/orders/checkout", checkoutPayload(payload), jsonConfig())).data),
  salesReport: async (params = {}) =>
    normalizeSalesReport((await apiClient.get("/orders/sales-report", { params })).data),
  update: async (id, payload) =>
    normalizeOrder(
      unwrapRecord(
        (
          await apiClient.patch(
            `/orders/status/${id}`,
            { orderStatus: payload.orderStatus ?? payload.order_status ?? payload.fulfillmentStatus ?? payload.status },
            jsonConfig(),
          )
        ).data,
      ),
    ),
  updatePaymentStatus: async (id, payload) =>
    normalizeOrder(
      unwrapRecord(
        (
          await apiClient.patch(
            `/orders/payment-status/${id}`,
            { paymentStatus: payload.paymentStatus ?? payload.payment_status ?? payload.status },
            jsonConfig(),
          )
        ).data,
      ),
    ),
  phonepeCallbackGet: async (params = {}) =>
    (await apiClient.get("/orders/phonepe/callback", { params })).data,
  phonepeCallbackPost: async (payload = {}) =>
    (await apiClient.post("/orders/phonepe/callback", payload, jsonConfig())).data,
};

export const returnRequestsApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/orders/return/list", { params: pageParams })).data,
      params,
      normalizeReturnRequest,
    ),
  request: async (payload) =>
    unwrapRecord(
      (
        await apiClient.post(
          "/orders/return/request",
          toFormData(payload, ["files"]),
          formConfig(),
        )
      ).data,
    ),
  handle: async (id, status) =>
    normalizeReturnRequest(
      unwrapRecord(
        (
          await apiClient.patch(
            `/orders/return/handle/${id}`,
            { status },
            jsonConfig(),
          )
        ).data,
      ),
    ),
};

export const brokerageApi = {
  createLead: async (payload) =>
    normalizeBrokerageLead(
      unwrapRecord((await apiClient.post("/brokerage/lead", payload, jsonConfig())).data),
    ),
  leads: async () =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/brokerage/leads", { params: pageParams })).data,
      {},
      normalizeBrokerageLead,
    ),
  createDeal: async (payload) =>
    normalizeBrokerageDeal(
      unwrapRecord((await apiClient.post("/brokerage/deal", payload, jsonConfig())).data),
    ),
  deals: async () =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/brokerage/deals", { params: pageParams })).data,
      {},
      normalizeBrokerageDeal,
    ),
};

export const mandiApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/mandi", { params: pageParams })).data,
      params,
      normalizeMandiRate,
    ),
  create: async (payload) =>
    normalizeMandiRate(
      unwrapRecord((await apiClient.post("/mandi", payload, jsonConfig())).data),
    ),
  update: async (id, payload) =>
    normalizeMandiRate(
      unwrapRecord((await apiClient.put(`/mandi/${id}`, payload, jsonConfig())).data),
    ),
  remove: async (id) => (await apiClient.delete(`/mandi/${id}`)).data,
};

export const settlementsApi = {
  list: async (params = {}) => {
    const { vendorId, ...rest } = params;
    if (!vendorId) {
      return listAllPages(
        async (pageParams) => (await apiClient.get("/settlements/list", { params: pageParams })).data,
        rest,
        normalizeSettlement,
      );
    }
    return listAllPages(
      async (pageParams) => (await apiClient.get(`/settlements/list/${vendorId}`, { params: pageParams })).data,
      rest,
      normalizeSettlement,
    );
  },
  create: async (payload) =>
    normalizeSettlement(
      unwrapRecord(
        (
          await apiClient.post(
            "/settlements/",
            toFormData(payload, ["proof_image"]),
            formConfig(),
          )
        ).data,
      ),
    ),
};

export const guideParentsApi = {
  list: async (params = {}) =>
    listAllPages(
      async (pageParams) => (await apiClient.get("/crops_guid_parent/parent", { params: pageParams })).data,
      params,
      normalizeGuideParent,
    ),
  detail: async (id) =>
    normalizeGuideParent(
      unwrapRecord((await apiClient.get(`/crops_guid_parent/parent/${id}`)).data),
    ),
  create: async (payload) =>
    normalizeGuideParent(
      unwrapRecord((await apiClient.post("/crops_guid_parent/parent", payload, jsonConfig())).data),
    ),
  update: async (id, payload) =>
    normalizeGuideParent(
      unwrapRecord((await apiClient.put(`/crops_guid_parent/parent/${id}`, payload, jsonConfig())).data),
    ),
  remove: async (id) =>
    (await apiClient.patch(`/crops_guid_parent/parent/delete/${id}`)).data,
};

