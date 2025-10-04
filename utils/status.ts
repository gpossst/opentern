export const getStatusButtonClass = (status: string) => {
  const buttonMap: Record<string, string> = {
    offered: "btn-success",
    rejected: "btn-error",
    interviewed: "btn-info",
    assessment: "btn-warning",
    applied: "btn-primary",
    interested: "btn-accent",
  };
  return buttonMap[status] || "bg-none";
};
