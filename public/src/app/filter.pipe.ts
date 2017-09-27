import { Pipe, PipeTransform } from '@angular/core';
import { User } from "./user";
import { Poll } from "./poll";

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, searchStr: string): any {
    if (!value) { return value; }

    return value.filter(user => {
      return user.name.includes(searchStr.toLowerCase()) || user.score.toString().includes(searchStr.toLowerCase())
    })
  }

}