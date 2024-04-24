import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], filter: Record<string, any>): any {
    if (!items || !filter) return items;

    if (Object.keys(filter).length <= 1) {
      const key = Object.keys(filter)[0];
      const value = (filter[key] || '').toLowerCase();

      return items.filter((e) => (e[key] || '').toString().toLowerCase().indexOf(value) !== -1);
    } else {
      const customType = filter['customType'];
      const result = items.filter((e) => {
        return Object.entries(filter).find(([key, value]: any) => {
          return key == 'customType' ? false : (e[key] || '').toString().toLowerCase().indexOf((value || '').toString().toLowerCase()) == -1;
        }) == null;
      });
      if (customType == "CDP_OBJECTS") {
        var module: any = null;
        result.forEach((data: any) => {
          data.showModuleName = module != data.module;
          module = data.module;
        });
      }
      return result;
    }

  }

}
