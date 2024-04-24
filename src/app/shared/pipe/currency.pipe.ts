import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'CurrencyPipe',
})
export class CurrencyPipe implements PipeTransform {
    transform(currencyValue: any) {
        if (typeof currencyValue === 'string') {
            switch (currencyValue) {
                case 'USD':
                    currencyValue = '$';
                    break;
                case 'EUR':
                    currencyValue = '€';
                    break;
                case 'GBP':
                    currencyValue = '£';
                    break;
                default:
                    return currencyValue;
            }
            return currencyValue;
        } else if (typeof currencyValue === 'number') {
            return currencyValue.toFixed(2);
        }

    }
}