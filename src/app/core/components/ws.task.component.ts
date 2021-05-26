import {StatusComponent} from './status.component';
import {WsFileComponent} from './ws.file.component';

export class WsTaskComponent {

  id: number;
  task: string;
  endDate: string;
  status: StatusComponent;
  file: WsFileComponent;
}
