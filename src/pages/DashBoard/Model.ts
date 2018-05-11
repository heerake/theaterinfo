import { Model } from '../../PageStore';

export default class DashBoardModel extends Model<any> {
  state = {
  };

  constructor() {
    super();
  }

  async speak() {
    alert(JSON.stringify(this.state));
  }
}
