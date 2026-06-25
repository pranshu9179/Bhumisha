import {
  BadgeIndianRupee,
  BookOpenText,
  Boxes,
  Bug,
  ClipboardList,
  CreditCard,
  Handshake,
  History,
  LayoutDashboard,
  PackagePlus,
  Store,
  ScanSearch,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCheck,
  UserRoundCog,
  Users,
  Warehouse,
} from "lucide-react";
import { ROLES } from "@/lib/constants";

export const navigationByRole = {
  [ROLES.ADMIN]: [
    {
      group: "Overview",
      items: [
        {
          title: "Dashboard",
          description: "Cross-role metrics, alerts, and marketplace health.",
          path: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: "Operations",
      items: [
        {
          title: "Users",
          description: "Manage all platform users.",
          path: "/admin/users",
          icon: Users,
        },
        {
          title: "Experts",
          description: "Track expert utilization.",
          path: "/admin/experts",
          icon: UserCheck,
        },
        {
          title: "Employees",
          description: "Coordinate support staff.",
          path: "/admin/employees",
          icon: UserRoundCog,
        },
        {
          title: "Vendor Verification",
          description: "Approve or reject marketplace vendors.",
          path: "/admin/vendors",
          icon: ShieldCheck,
        },
        {
          title: "Queries",
          description: "Review farmer query records, replies, and activity.",
          path: "/admin/queries",
          icon: ClipboardList,
        },
        {
          title: "Crop Categories",
          description: "Bilingual crop taxonomy and soft-delete controls.",
          path: "/admin/categories",
          icon: ScanSearch,
        },
        {
          title: "Crop",
          description: "Catalog, pricing, and stock governance.",
          path: "/admin/products",
          icon: Boxes,
        },
        {
          title: "Product List",
          description: "Create, approve, and update marketplace products.",
          path: "/admin/product-list",
          icon: PackagePlus,
        },
        {
          title: "Guide Headings",
          description: "Bilingual crop guide section headings.",
          path: "/admin/guide-headings",
          icon: BookOpenText,
        },
        {
          title: "Guide Details",
          description: "Crop-wise guide content and media.",
          path: "/admin/guide-details",
          icon: ClipboardList,
        },
        {
          title: "Crop Diseases",
          description: "Diagnostic disease records and visual references.",
          path: "/admin/crop-diseases",
          icon: Bug,
        },
        {
          title: "Marketplace Taxonomy",
          description: "Product categories, subcategories, and vendor capabilities.",
          path: "/admin/marketplace-taxonomy",
          icon: Boxes,
        },
        {
          title: "Orders",
          description: "Order flow and commerce status.",
          path: "/admin/orders",
          icon: ShoppingCart,
        },
        {
          title: "Mandi Rates",
          description: "Daily mandi price records and modal rates.",
          path: "/admin/mandi-rates",
          icon: BadgeIndianRupee,
        },
        {
          title: "Settlements",
          description: "Vendor payout records and proof uploads.",
          path: "/admin/settlements",
          icon: CreditCard,
        },
        {
          title: "Brokerage",
          description: "Group B service leads and commission deal logs.",
          path: "/admin/brokerage",
          icon: Handshake,
        },
        // {
        //   title: "Guide Parents",
        //   description: "Link crops with guide headings.",
        //   path: "/admin/guide-parents",
        //   icon: BookOpenText,
        // },
      ],
    },
  ],
  [ROLES.EXPERT]: [
    {
      group: "Workspace",
      items: [
        {
          title: "Dashboard",
          description: "Assigned workload and response performance.",
          path: "/expert",
          icon: LayoutDashboard,
        },
        {
          title: "Assigned Queries",
          description: "Live advisory queue for expert handling.",
          path: "/expert/queries",
          icon: ClipboardList,
        },
        {
          title: "Suggested Products",
          description: "Products mapped to recommendations.",
          path: "/expert/products",
          icon: PackagePlus,
        },
        {
          title: "History",
          description: "Closed and previously handled cases.",
          path: "/expert/history",
          icon: History,
        },
      ],
    },
  ],
  [ROLES.EMPLOYEE]: [
    {
      group: "Coordination",
      items: [
        {
          title: "Dashboard",
          description: "Open support load and SLA health.",
          path: "/employee",
          icon: LayoutDashboard,
        },
        {
          title: "Monitoring",
          description: "Delayed query detection and control tower.",
          path: "/employee/monitoring",
          icon: ClipboardList,
        },
        {
          title: "Products",
          description: "Create, review, and update marketplace products.",
          path: "/employee/products",
          icon: Boxes,
        },
        {
          title: "Add Product",
          description: "Create an auto-approved product listing.",
          path: "/employee/products/new",
          icon: PackagePlus,
        },
      ],
    },
  ],
  [ROLES.VENDOR]: [
    {
      group: "Commerce",
      items: [
        {
          title: "Dashboard",
          description: "Store performance, dispatch health, and stock alerts.",
          path: "/vendor",
          icon: LayoutDashboard,
        },
        {
          title: "Products",
          description: "Published catalog and product controls.",
          path: "/vendor/products",
          icon: Boxes,
        },
        {
          title: "Store Setup",
          description: "Vendor registration, service region, and payment credentials.",
          path: "/vendor/store-setup",
          icon: ShieldCheck,
        },
        {
          title: "Add Product",
          description: "Create a new listing in the marketplace.",
          path: "/vendor/products/new",
          icon: PackagePlus,
        },
        {
          title: "Inventory",
          description: "Stock depth and replenishment planning.",
          path: "/vendor/inventory",
          icon: Warehouse,
        },
        {
          title: "Orders",
          description: "Incoming orders and fulfillment updates.",
          path: "/vendor/orders",
          icon: ShoppingCart,
        },
        {
          title: "Checkout",
          description: "Saved addresses, checkout, payment verification, and purchases.",
          path: "/vendor/checkout",
          icon: CreditCard,
        },
        {
          title: "Dispatch",
          description: "Shipment pipeline and delivery status.",
          path: "/vendor/dispatch",
          icon: Truck,
        },
        {
          title: "Reports",
          description: "Revenue, products, and conversion insights.",
          path: "/vendor/reports",
          icon: BadgeIndianRupee,
        },
      ],
    },
  ],
  [ROLES.USER]: [
    {
      group: "Farmer",
      items: [
        {
          title: "Dashboard",
          description: "Your farmer workspace and account overview.",
          path: "/user",
          icon: LayoutDashboard,
        },
        {
          title: "Become a Vendor",
          description: "Register your vendor profile and start selling.",
          path: "/user/become-vendor",
          icon: Store,
        },
        {
          title: "Checkout",
          description: "PhonePe checkout, saved addresses, and order history.",
          path: "/user/checkout",
          icon: CreditCard,
        },
      ],
    },
  ],
};

export const utilityRoutes = [
  {
    title: "Admin Query Detail",
    path: "/admin/queries/:id",
    description: "Detailed admin query review and answer composer.",
  },
  {
    title: "Employee Query Detail",
    path: "/employee/queries/:id",
    description: "Employee query review and answer composer.",
  },
  {
    title: "Query Detail",
    path: "/expert/queries/:id",
    description: "Detailed expert review and recommendation composer.",
  },
  {
    title: "Edit Product",
    path: "/vendor/products/:id/edit",
    description: "Update product content, price, and stock strategy.",
  },
  {
    title: "Edit Admin Product",
    path: "/admin/product-list/:id/edit",
    description: "Update product content, price, stock, and approval.",
  },
  {
    title: "Edit Employee Product",
    path: "/employee/products/:id/edit",
    description: "Update product content, price, stock, and approval.",
  },
];

export function getFlatNavigation(role) {
  return navigationByRole[role]?.flatMap((section) => section.items) ?? [];
}
