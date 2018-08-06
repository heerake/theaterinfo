import sgt from '../data/sgt';
import shoac from '../data/shoac';
import sso from '../data/sso';
import moment from 'moment';
import _ from 'lodash-es';

let _allData = sgt.concat(shoac).concat(sso);
_allData = _allData.filter(t=>{
  t.date = t.date.filter(d=> new Date(d) > new Date());
  return t.date.length;
});
_allData.sort((t1, t2) => t1.date > t2.date ? 1 : -1);

export default {
  getAllData() {
    return _allData;
  },
  getFilterData(startDate, endDate, keyWords) {
    return _allData.filter(t => {
      let pass = true;
      if (startDate || endDate) {
        let showDates = _.map(t.date, p => new Date(p));

        if (startDate) {
          let sDate = new Date(startDate);
          pass = pass && _.some(showDates, p => sDate <= p);
        }

        if (endDate) {
          let eDate = new Date(endDate);
          pass = pass && _.some(showDates, p => eDate >= p);
        }
      }

      if (keyWords) {
        pass = pass && t.title.toLowerCase().indexOf(keyWords.toLowerCase()) > -1;
      }

      return pass;
    })
  }
}