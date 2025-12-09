import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { FilteredDataInterface, FilteredPayload, MetaDataPayload, VPIDataItem } from '../interfaces/vpi-interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  public apiResponse = '';
  public api = "https://spring-boot-jwt-8utp.onrender.com";
  private filteredUrl = this.api + `/fetch-metadata`;
  private recordingUrl = this.api + `/recording`;
  private recordingMetaDataUrl = this.api + `/recording-metadata`;
  private downloadRecordingsUrl = this.api + `/download-recordings`;
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  public getFilteredData(payload: FilteredPayload): Observable<FilteredDataInterface> {
    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post<FilteredDataInterface>(this.filteredUrl, payload, { headers });
      })
    );
  }

  public getMetaData(payload: MetaDataPayload): Observable<VPIDataItem> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post<VPIDataItem>(this.recordingMetaDataUrl, payload, { headers });
      })
    );
  }

  public getAudioRecordings(payload: MetaDataPayload): Observable<Blob> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post(this.recordingUrl, payload, { headers, responseType: 'blob' });
      })
    );

  }

  public downloadRecordings(payload: MetaDataPayload[]): Observable<Blob> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.post(this.downloadRecordingsUrl, payload, {
          headers,
          responseType: 'blob'
        });
      })
    );
  }
}









