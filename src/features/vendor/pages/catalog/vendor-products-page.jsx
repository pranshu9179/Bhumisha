import { Edit2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/feedback/status-badge";
import { PreviewableImage } from "@/components/media/previewable-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/features/shared/components/page-header";
import { RecordDetailsDialog } from "@/features/shared/components/record-details-dialog";
import {
  belongsToVendor,
  vendorIdentifiers,
} from "@/features/vendor/hooks/use-vendor-shop-products";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency } from "@/lib/format";
import {
  useShopProductStatusMutation,
  useShopProducts,
  useVendorProfile,
} from "@/services/api/hooks";

function productBasePath(role) {
  if (role === "admin") return "/admin/product-list";
  if (role === "employee") return "/employee/products";
  return "/vendor/products";
}

function productImage(product) {
  return product.image_url || product.image || product.images?.[0];
}

function productId(product) {
  return (
    product?.id ||
    product?.product_id ||
    product?.productId ||
    product?._id ||
    product?.english?.id ||
    product?.english?.product_id
  );
}

function isInactiveProduct(product) {
  const status = String(product?.status || "").toLowerCase();
  return (
    status === "inactive" ||
    status === "deleted" ||
    product?.is_delete === true ||
    product?.isDelete === true
  );
}

function mergeProducts(...lists) {
  const byId = new Map();
  lists.flat().forEach((product) => {
    const id = productId(product);
    if (id) byId.set(String(id), product);
  });
  return Array.from(byId.values());
}

function ProductStatusToggleButton({ product, disabled = false }) {
  const [open, setOpen] = useState(false);
  const mutation = useShopProductStatusMutation();
  const inactive = isInactiveProduct(product);
  const nextStatus = inactive ? "active" : "inactive";
  const Icon = inactive ? RotateCcw : Trash2;
  const label = inactive ? "Restore" : "Delete";

  const handleToggle = async (event) => {
    event?.stopPropagation?.();
    try {
      await mutation.mutateAsync({
        id: productId(product),
        status: nextStatus,
      });
      toast.success(
        inactive
          ? "Product restored successfully."
          : "Product deleted successfully.",
      );
      setOpen(false);
    } catch (error) {
      toast.error(error.displayMessage || "Unable to update product status.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={inactive ? "secondary" : "danger"}
          disabled={disabled || mutation.isPending}
          onClick={(event) => event.stopPropagation()}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {inactive ? "Restore product" : "Delete product"}
          </DialogTitle>
          <DialogDescription>
            {inactive
              ? `Restore ${product.name || "this product"} so it appears in active product lists again?`
              : `Set ${product.name || "this product"} as inactive? You can restore it from the Deleted tab.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={inactive ? "default" : "danger"}
            disabled={mutation.isPending}
            onClick={handleToggle}
          >
            {mutation.isPending ? "Updating..." : label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function productVendorName(product) {
  return (
    product.vendorName ||
    product.vendor_name ||
    product.companyName ||
    product.company_name ||
    product.vendor?.company_name ||
    product.vendor?.name ||
    "-"
  );
}

export function VendorProductsPage() {
  const user = useCurrentUser();
  const role = user?.role || "vendor";
  const basePath = productBasePath(role);
  const canApprove = role === "admin" || role === "employee";
  const canCreate = ["admin", "employee", "vendor"].includes(role);
  const [filters, setFilters] = useState({
    tag: "",
    city: "",
    district: "",
    state: "",
  });
  const { data: vendorProfile } = useVendorProfile({
    enabled: role === "vendor",
  });
  const productParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      search: "",
      tag: filters.tag.trim() || undefined,
      city: filters.city.trim(),
      district: filters.district.trim(),
      state: filters.state.trim(),
      crop_id: "",
    }),
    [filters],
  );
  const activeProductParams = useMemo(
    () => ({ ...productParams, status: "active" }),
    [productParams],
  );
  const inactiveProductParams = useMemo(
    () => ({ ...productParams, status: "inactive" }),
    [productParams],
  );
  const { data: activeProductResponse = [], isLoading: activeLoading } =
    useShopProducts(activeProductParams);
  const { data: inactiveProductResponse = [], isLoading: inactiveLoading } =
    useShopProducts(inactiveProductParams);
  const vendorIds = useMemo(
    () => vendorIdentifiers(user, vendorProfile),
    [user, vendorProfile],
  );

  const roleProducts = useMemo(
    () => (items) =>
      role === "vendor"
        ? items.filter((product) => belongsToVendor(product, vendorIds))
        : items,
    [role, vendorIds],
  );
  const activeProducts = useMemo(
    () =>
      roleProducts(activeProductResponse).filter(
        (product) => !isInactiveProduct(product),
      ),
    [activeProductResponse, roleProducts],
  );
  const inactiveProducts = useMemo(
    () => roleProducts(inactiveProductResponse).filter(isInactiveProduct),
    [inactiveProductResponse, roleProducts],
  );
  const products = useMemo(
    () => mergeProducts(activeProducts, inactiveProducts),
    [activeProducts, inactiveProducts],
  );
  const isLoading = activeLoading || inactiveLoading;

  const filtersSlot = (
    <div className="grid w-full gap-2 md:grid-cols-4 xl:max-w-4xl">
      <Input
        value={filters.tag}
        onChange={(event) =>
          setFilters((current) => ({ ...current, tag: event.target.value }))
        }
        placeholder="Tag"
      />
      <Input
        value={filters.city}
        onChange={(event) =>
          setFilters((current) => ({ ...current, city: event.target.value }))
        }
        placeholder="City"
      />
      <Input
        value={filters.district}
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            district: event.target.value,
          }))
        }
        placeholder="District"
      />
      <Input
        value={filters.state}
        onChange={(event) =>
          setFilters((current) => ({ ...current, state: event.target.value }))
        }
        placeholder="State"
      />
    </div>
  );

  const columns = useMemo(
    () => [
      {
        header: "Product",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <PreviewableImage
              src={productImage(row.original)}
              alt={row.original.name}
              className="h-12 w-12 rounded-lg object-cover"
              fallbackClassName="h-12 w-12 rounded-lg"
              previewTitle={`${row.original.name} image`}
            />
            <div>
              <p className="font-semibold text-dark">{row.original.name}</p>
              <p className="text-xs text-slate-400">
                {row.original.company_name ||
                  (row.original.tags || []).join(", ")}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "categoryName",
        cell: ({ row }) =>
          row.original.categoryName || row.original.category_name || "-",
      },
      {
        header: "Vendor",
        accessorKey: "vendorName",
        cell: ({ row }) => productVendorName(row.original),
      },
      {
        header: "MRP",
        accessorKey: "mrp",
        cell: ({ row }) => formatCurrency(row.original.mrp),
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        header: "Vendor price",
        accessorKey: "vendor_price",
        cell: ({ row }) => formatCurrency(row.original.vendor_price),
      },
      { header: "Stock", accessorKey: "stock" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        header: "Actions",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const id = productId(row.original);
          const isOwnProduct = belongsToVendor(row.original, vendorIds);
          const inactive = isInactiveProduct(row.original);
          const canEdit =
            Boolean(id) && !inactive && (canApprove || isOwnProduct);
          const canToggleStatus =
            Boolean(id) && (canApprove || (role === "vendor" && isOwnProduct));

          return (
            <div className="flex flex-wrap items-center gap-2">
              <RecordDetailsDialog
                title={`${row.original.name} details`}
                description="Product-level details from /api/products/all."
                record={row.original}
              />
              {canEdit ? (
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Link to={`${basePath}/${id}/edit`}>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              ) : null}
              {canToggleStatus ? (
                <ProductStatusToggleButton product={row.original} />
              ) : null}
            </div>
          );
        },
      },
    ],
    [basePath, canApprove, role, vendorIds],
  );

  useEffect(() => {
    console.log(inactiveProducts, "ASDFGHJK");
  }, [inactiveProducts]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={role === "vendor" ? "Vendor products" : "Marketplace products"}
        description={
          role === "vendor"
            ? "Manage your listings and review active products available in the marketplace."
            : "Create, approve, and update marketplace products using the documented product APIs."
        }
        compact
        actions={
          canCreate ? (
            <Button asChild>
              <Link to={`${basePath}/new`}>
                <Plus className="h-4 w-4" />
                Add product
              </Link>
            </Button>
          ) : null
        }
      />
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeProducts.length})
          </TabsTrigger>
          <TabsTrigger value="deleted">
            Deleted ({inactiveProducts.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({products.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeProducts}
            searchPlaceholder="Search active products..."
            emptyMessage={
              activeLoading
                ? "Loading products..."
                : "No active products found."
            }
            filterSlot={filtersSlot}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DataTable
            columns={columns}
            data={inactiveProducts}
            searchPlaceholder="Search deleted products..."
            emptyMessage={
              inactiveLoading
                ? "Loading deleted products..."
                : "No deleted products found."
            }
            filterSlot={filtersSlot}
          />
        </TabsContent>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={products}
            searchPlaceholder="Search name, description, tags..."
            emptyMessage={
              isLoading ? "Loading products..." : "No products found."
            }
            filterSlot={filtersSlot}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VendorProductsPage;
