import { Injectable } from '@angular/core';
import { CommonService } from '../../../service/common.service';

@Injectable({
  providedIn: 'root'
})
export class ClipBoardService {

  constructor(private commonService: CommonService) { }

  copy(type: string, text: string, target: any = document.body) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    target.appendChild(textArea);
    textArea.select();
    console.log(document.execCommand('copy'));
    this.commonService.toster.success(`${type} Copied`);
    target.removeChild(textArea);
  }
}
