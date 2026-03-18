import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationResponse, ApplicationStatusUpdateRequest } from '../../models/application.models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly apiUrl = `${environment.apiUrl}/api/applications`;

  constructor(private readonly http: HttpClient) {}

  applyForJob(jobOfferId: number): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(`${this.apiUrl}/apply/${jobOfferId}`, {});
  }

  getMyApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.apiUrl}/my-applications`);
  }

  getApplicationsByJobOffer(jobOfferId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.apiUrl}/job-offer/${jobOfferId}`);
  }

  updateApplicationStatus(id: number, req: ApplicationStatusUpdateRequest): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.apiUrl}/${id}/status`, req);
  }
}
