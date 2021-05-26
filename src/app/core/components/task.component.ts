import { FileComponent } from './file.component';
import { StatusComponent } from './status.component';

export class TaskComponent {

    id: number;
    task: string;
    endDate: string;
    status: StatusComponent;
    file: FileComponent;
}
