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
          title: "User Management",
          icon: Users,
          description: "Manage all platform roles and vendors.",
          subItems: [
            { title: "Users", path: "/admin/users" },
            { title: "Experts", path: "/admin/experts" },
            { title: "Employees", path: "/admin/employees" },
            { title: "Vendor Verification", path: "/admin/vendors" },
          ],
        },
        {
          title: "Crop Related",
          icon: Boxes,
          description: "Manage crop taxonomy and guides.",
          subItems: [
            { title: "Crop Category", path: "/admin/categories" },
            { title: "CROP", path: "/admin/products" },
            { title: "Crop Guide Heading", path: "/admin/guide-headings" },
            { title: "Crop Guide Details", path: "/admin/guide-details" },
          ],
        },
        {
          title: "Orders",
          icon: ShoppingCart,
          description: "Manage marketplace orders.",
          subItems: [
            { title: "All Orders", path: "/admin/orders", id: 'orders_all' },
            { title: "Total Orders", path: "/admin/orders?tab=orders", id: 'orders_total' },
            { title: "Pending orders", path: "/admin/orders?tab=orders&filter_status=pending", id: 'orders_pending' },
            { title: "dispatched", path: "/admin/orders?tab=orders&filter_status=dispatched", id: 'orders_dispatched' },
            { title: "delivered", path: "/admin/orders?tab=orders&filter_status=delivered", id: 'orders_delivered' },
            { title: "Sales Report", path: "/admin/sales-report" },
          ],
        },
        {
          title: "Services",
          icon: Handshake,
          description: "Service bookings and enquiries.",
          subItems: [
            { title: "All Services", path: "/admin/service-bookings" },
            { title: "Pending Enquiry", path: "/admin/service-bookings?filter_status=pending" },
            { title: "Estimate done", path: "/admin/service-bookings?filter_status=estimate" },
            { title: "Deal close", path: "/admin/service-bookings?filter_status=completed" },
            { title: "Deal Lost", path: "/admin/service-bookings?filter_status=cancelled" },
          ],
        },
        {
          title: "Mandi",
          icon: BadgeIndianRupee,
          description: "Manage mandi rates.",
          subItems: [
            { title: "Add Entry", path: "/admin/mandi-rates" },
            { title: "view Entry", path: "/admin/mandi-rates" },
          ],
        },
        {
          title: "Payment settlement Pending",
          icon: CreditCard,
          description: "Pending vendor payouts.",
          subItems: [
            { title: "Service Based settlement", path: "/admin/settlements?filter_status=pending&type=service" },
        //    { title: "Product Based settlement", path: "/admin/settlements?filter_status=pending&type=product" },
          ],
        },
        // {
        //   title: "Payment Settlement done",
        //   icon: CreditCard,
        //   description: "Completed vendor payouts.",
        //   subItems: [
        //     { title: "Service Based settlement", path: "/admin/settlements?filter_status=completed&type=service" },
        //     { title: "Product Based settlement", path: "/admin/settlements?filter_status=completed&type=product" },
        //   ],
        // }, 
        {
          title: "Product Management",
          icon: Boxes,
          description: "Manage product categories and listings.",
          subItems: [
            { title: "Product Taxonomy", path: "/admin/marketplace-taxonomy" },
            { title: "Product List", path: "/admin/product-list" },
          ],
        },
        {
          title: "Farmer Crop Queries",
          description: "Review farmer query records, replies, and activity.",
          path: "/admin/queries",
          icon: ClipboardList,
        },
     //   {
     //     title: "Crop Diseases",
     //     description: "Diagnostic disease records and visual references.",
     //     path: "/admin/crop-diseases",
     //     icon: Bug,
     //   },
        // {
        //   title: "Brokerage",
        //   description: "Group B service leads and commission deal logs.",
        //   path: "/admin/brokerage",
        //   icon: Handshake,
        // },
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
          title: "Service Bookings",
          description: "Review service requests and update status.",
          path: "/employee/service-bookings",
          icon: Handshake,
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
        // Dispatch controls now live inside the Orders page so vendors can update fulfillment from one queue.
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
          title: "Service Booking",
          description: "Request farming services from available vendors.",
          path: "/user/service-bookings",
          icon: Handshake,
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
