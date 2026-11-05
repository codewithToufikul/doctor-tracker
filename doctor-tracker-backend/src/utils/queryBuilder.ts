export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const parsePagination = (query: { page?: unknown; limit?: unknown }): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit), 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const formatPaginationMeta = (
  totalRecords: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    totalRecords,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const buildDateRangeFilter = (
  startDate?: string,
  endDate?: string,
  dateField = 'createdAt'
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (!startDate && !endDate) return filter;

  const dateConditions: Record<string, Date> = {};

  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      dateConditions.$gte = start;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      dateConditions.$lte = end;
    }
  }

  if (Object.keys(dateConditions).length > 0) {
    filter[dateField] = dateConditions;
  }

  return filter;
};
