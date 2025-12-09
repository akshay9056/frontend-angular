import {  Injectable, signal } from '@angular/core'; 
import {   FilteredPayload, VPIDataItem } from '../interfaces/vpi-interface';
   

@Injectable({
  providedIn: 'root'
})
export class DataService {
public pagedDataSignal = signal<VPIDataItem[]>([]);
public totalRecordsSignal = signal(0);


private payloadSignal = signal<FilteredPayload>({
  filters: {},
  pagination: {
    pageNumber: 1,
    pageSize: 10
  }
});

  public payload = this.payloadSignal;

  getPayload() {
    return this.payloadSignal();
  }

  setPayload(payload: FilteredPayload) { 
    this.payloadSignal.set(payload);
  }

  getTotalRecords() {
    return this.totalRecordsSignal();
  }

  setTotalRecords(count: number) {
    this.totalRecordsSignal.set(count);
  }
  public loadingTableDataSignal = signal<boolean>(false);
   public successToasterSignal = signal<boolean>(true);
   public vpiDataSignal = signal<VPIDataItem[]>([]);  


}
 