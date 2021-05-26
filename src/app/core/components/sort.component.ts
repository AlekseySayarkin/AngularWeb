import { SortConstant } from '../constants/sort-constant';

export class SortComponent {

    sortType: string = SortConstant.DEFAULT_SORT_TYPE;
    sortBy: string = SortConstant.DEFAULT_SORT_BY;
    statusFilter: string = SortConstant.DEFAULT_STATUS_FILTER;
}
