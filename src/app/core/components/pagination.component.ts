import { PaginationConstant } from "../constants/pagination-constant";

export class PaginationComponent {

    page: number = PaginationConstant.DEFAULT_PAGE;
    size: number = PaginationConstant.DEFAULT_SIZE;
    count: number;
    totalPages: number;
}
