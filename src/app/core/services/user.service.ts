import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateProfileResponse } from '../../models/candidate.models';
import { ApplicationResponse } from '../../models/application.models';
import { PageResponse } from '../../models/pagination.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/admin/users`;

  constructor(private readonly http: HttpClient) {}

  getAllUsersPaginated(
    page: number = 0,
    size: number = 10,
    sort: string[] = ['id,desc']
  ): Observable<PageResponse<CandidateProfileResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach((s) => {
      params = params.append('sort', s);
    });

    return this.http.get<PageResponse<CandidateProfileResponse>>(this.apiUrl, { params });
  }

  getCandidateProfileById(candidateId: number): Observable<CandidateProfileResponse> {
    return this.http.get<CandidateProfileResponse>(`${this.apiUrl}/${candidateId}/profile`);
  }

  getCandidateApplications(
    candidateId: number,
    page: number = 0,
    size: number = 10,
    sort: string[] = ['appliedAt,desc']
  ): Observable<PageResponse<ApplicationResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach((s) => {
      params = params.append('sort', s);
    });

    return this.http.get<PageResponse<ApplicationResponse>>(
      `${this.apiUrl}/${candidateId}/applications`,
      { params }
    );
  }
}
