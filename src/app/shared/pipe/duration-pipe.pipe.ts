import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationPipe',
})
export class DurationPipePipe implements PipeTransform {

  transform(value: any) {
    if (typeof value === 'number') {
      const hours = Math.floor(value / 3600000);
      const minutes = Math.floor((value % 3600000) / 60000);
      const seconds = Math.floor((value % 60000) / 1000);
      const milliseconds = value % 1000;

      let result = '';
      if (hours > 0) {
        result += `${hours} h, `;
      }
      if (minutes > 0 || result !== '') {
        result += `${minutes} min, `;
      }
      if (seconds > 0 || result !== '') {
        result += `${seconds} sec, `;
      }
      if (milliseconds > 0 || result === '') {
        result += `${milliseconds} ms`;
      }

      return result.trim();
    } else {
      return value;
    }
  }

}
