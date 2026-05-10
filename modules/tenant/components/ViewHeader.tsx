import React from "react";

interface ViewHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function ViewHeader({ title, description, action }: ViewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 bg-white border border-au-lait rounded-2xl p-6 shadow-sm mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-inkwell mb-1">{title}</h1>
        {description && <p className="text-sm text-lunar-eclipse">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
