import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isExpanded = new BehaviorSubject<boolean>(false);
  isExpanded$ = this.isExpanded.asObservable();

  toggle() {
    const newState = !this.isExpanded.value;
    console.log('SidebarService: Toggling sidebar ->', newState);
    this.isExpanded.next(newState);
  }

  collapse() {
    this.isExpanded.next(false);
  }

  expand() {
    this.isExpanded.next(true);
  }
}