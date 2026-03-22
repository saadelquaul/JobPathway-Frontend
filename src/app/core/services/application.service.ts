import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationResponse, ApplicationStatusUpdateRequest } from '../../models/application.models';
import { PageResponse } from '../../models/pagination.models';

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

  getMyApplicationsPaginated(page: number = 0, size: number = 10, sort: string[] = ['appliedAt,desc']): Observable<PageResponse<ApplicationResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach(s => {
      params = params.append('sort', s);
    });

    return this.http.get<PageResponse<ApplicationResponse>>(`${this.apiUrl}/my-applications`, { params });
  }

  getApplicationsByJobOffer(jobOfferId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.apiUrl}/job-offer/${jobOfferId}`);
  }

  getApplicationsByJobOfferPaginated(jobOfferId: number, page: number = 0, size: number = 10, sort: string[] = ['appliedAt,desc']): Observable<PageResponse<ApplicationResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach(s => {
      params = params.append('sort', s);
    });

    return this.http.get<PageResponse<ApplicationResponse>>(`${this.apiUrl}/job-offer/${jobOfferId}`, { params });
  }

  updateApplicationStatus(id: number, req: ApplicationStatusUpdateRequest): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.apiUrl}/${id}/status`, req);
  }
}
