import type { ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

type Crumb = {
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-slate-500 dark:text-slate-400">
        {items.map((item, index) => (
          <Fragment key={`${String(item.label)}-${index}`}>
            {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href} className="inline-flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-slate-900 dark:text-slate-100">
                  {item.icon}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
