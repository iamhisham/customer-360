import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'PhoneNumberPipe',
})
export class PhoneNumberPipe implements PipeTransform {
  transform(phoneNumber: string) {
    if (!phoneNumber) return '';
    if (phoneNumber.length < 13) {
      const matchPhoneNr: any = 13 - phoneNumber.length;
      const multipleData: string = '0'.repeat(matchPhoneNr);
      phoneNumber += multipleData;
    };
    if (phoneNumber.length === 13) {
      const formattedPhoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
      return formattedPhoneNumber;
    } else return '';
  }
}