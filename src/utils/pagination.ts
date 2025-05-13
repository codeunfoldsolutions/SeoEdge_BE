export interface PaginationInfo {
  next: number | null;
  prev: number | null;
}

export class Pagination {
  perPage: number;
  page: number;

  constructor(perPage: number, page: number = 1) {
    this.perPage = perPage;
    // ensure page is at least 1
    this.page = page < 1 ? 1 : page;
    console.log(this.perPage * (this.page - 1));
  }

  /**
   * Number of documents to skip.
   * Page 1 skips 0, page 2 skips perPage, etc.
   */
  get skip(): number {
    return this.perPage * (this.page - 1);
  }

  /**
   * We fetch one extra record beyond perPage so
   * we can detect if a next page exists.
   */
  get limit(): number {
    return this.perPage + 1;
  }

  /**
   * Given *fetchedCount* (i.e. number of docs actually returned by your query),
   * decide which pages exist.
   */
  getPaginationInfo(fetchedCount: number): PaginationInfo {
    // if we got more than perPage, there *is* a next page
    const hasNext = fetchedCount > this.perPage;
    return {
      next: hasNext ? this.page + 1 : null,
      prev: this.page > 1 ? this.page - 1 : null,
    };
  }
}
