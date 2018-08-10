import sgt from '../data/sgt';
import shoac from '../data/shoac';
import sso from '../data/sso';
import moment from 'moment';
import _ from 'lodash-es';

let _allData = sgt.concat(shoac).concat(sso);
_allData = _allData.filter(t => {
  t.date = t.date.filter(d => new Date(d.date) > new Date());
  _.each(t.date, d => {

    if (d.price) {
      d.price.sort((t1, t2) => t1.price > t2.price ? 1 : -1);
    }
  })
  return t.date.length;
});
_allData.sort((t1, t2) => t1.date[0].date > t2.date[0].date ? 1 : -1);

export default {
  getAllData() {
    return _allData;
  },
  getFilterData(startDate, endDate, keyWords) {
    let filterData = _allData.filter(t => {
      t.matchKey = 0;

      let pass = true;
      if (startDate || endDate) {
        let showDates = _.map(t.date, p => new Date(p.date));

        if (startDate) {
          let sDate = new Date(startDate);
          pass = pass && _.some(showDates, p => sDate <= p);
        }

        if (endDate) {
          let eDate = new Date(endDate);
          pass = pass && _.some(showDates, p => eDate >= p);
        }
      }

      if (pass && keyWords) {
        let keys = keyWords.toLowerCase().split(' ');

        let matchKey = _.filter(keys, (k) => {
          return k && t.title.toLowerCase().indexOf(k) > -1;
        });

        pass = pass && matchKey.length;

        if (pass) {
          t.matchKey = matchKey.length;
        }
      }

      return pass;
    });
    
    if(keyWords){
      filterData.sort((t1, t2) => t1.matchKey < t2.matchKey ? 1 : (t1.matchKey === t2.matchKey ? 0 : -1));
    }
    
    return filterData;
  }
}