import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobOfferRequest, JobOfferResponse, JobOfferStatusRequest } from '../../models/job.models';
import { PageResponse } from '../../models/pagination.models';

@Injectable({ providedIn: 'root' })
export class JobOfferService {
  private readonly apiUrl = `${environment.apiUrl}/api/job-offers`;

  constructor(private readonly http: HttpClient) {}

  getAllJobOffers(): Observable<JobOfferResponse[]> {
    return this.http.get<JobOfferResponse[]>(this.apiUrl);
  }

  getAllJobOffersPaginated(page: number = 0, size: number = 10, sort: string[] = ['createdAt,desc']): Observable<PageResponse<JobOfferResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach(s => {
      params = params.append('sort', s);
    });

    return this.http.get<PageResponse<JobOfferResponse>>(this.apiUrl, { params });
  }

  getOpenJobOffers(): Observable<JobOfferResponse[]> {
    return this.http.get<JobOfferResponse[]>(`${this.apiUrl}/open`);
  }

  getOpenJobOffersPaginated(page: number = 0, size: number = 10, sort: string[] = ['createdAt,desc']): Observable<PageResponse<JobOfferResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach(s => {
      params = params.append('sort', s);
    });

    return this.http.get<PageResponse<JobOfferResponse>>(`${this.apiUrl}/open`, { params });
  }

  getJobOfferById(id: number): Observable<JobOfferResponse> {
    return this.http.get<JobOfferResponse>(`${this.apiUrl}/${id}`);
  }

  createJobOffer(req: JobOfferRequest): Observable<JobOfferResponse> {
    return this.http.post<JobOfferResponse>(this.apiUrl, req);
  }

  updateJobOffer(id: number, req: JobOfferRequest): Observable<JobOfferResponse> {
    return this.http.put<JobOfferResponse>(`${this.apiUrl}/${id}`, req);
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateJobOfferStatus(id: number, req: JobOfferStatusRequest): Observable<JobOfferResponse> {
    return this.http.put<JobOfferResponse>(`${this.apiUrl}/${id}/status`, req);
  }
}
