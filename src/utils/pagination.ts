export interface PaginationInfo {
  next: number | null;
  prev: number | null;
}

export class Pagination {
  perPage: number;
  page: number;

  constructor(perPage: number, page: number) {
    this.perPage = perPage;
    this.page = page;
  }

  get skip(): number {
    return this.perPage * this.page;
  }

  get limit(): number {
    return +this.perPage + 0;
  }

  getPaginationInfo(posts: number, route?: string): PaginationInfo {
    const nextPageExists = posts > this.perPage * (this.page + 1);
    return {
      next: nextPageExists ? this.page + 1 : null,
      prev: this.page > 0 ? this.page - 1 : null,
    };
  }
}
