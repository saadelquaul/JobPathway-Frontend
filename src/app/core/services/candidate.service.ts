import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CandidateProfileResponse,
  CandidateProfileUpdateRequest,
  EducationDTO,
  ExperienceDTO,
  CandidateSkillDTO,
} from '../../models/candidate.models';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly apiUrl = `${environment.apiUrl}/api/candidate`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<CandidateProfileResponse> {
    return this.http.get<CandidateProfileResponse>(`${this.apiUrl}/profile`);
  }

  updateProfile(req: CandidateProfileUpdateRequest): Observable<CandidateProfileResponse> {
    return this.http.put<CandidateProfileResponse>(`${this.apiUrl}/profile`, req);
  }

  uploadResume(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/resume`, formData);
  }

  uploadProfilePicture(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/profile-picture`, formData);
  }

  addEducation(dto: EducationDTO): Observable<CandidateProfileResponse> {
    return this.http.post<CandidateProfileResponse>(`${this.apiUrl}/education`, dto);
  }

  updateEducation(id: number, dto: EducationDTO): Observable<CandidateProfileResponse> {
    return this.http.put<CandidateProfileResponse>(`${this.apiUrl}/education/${id}`, dto);
  }

  deleteEducation(id: number): Observable<CandidateProfileResponse> {
    return this.http.delete<CandidateProfileResponse>(`${this.apiUrl}/education/${id}`);
  }

  addExperience(dto: ExperienceDTO): Observable<CandidateProfileResponse> {
    return this.http.post<CandidateProfileResponse>(`${this.apiUrl}/experience`, dto);
  }

  updateExperience(id: number, dto: ExperienceDTO): Observable<CandidateProfileResponse> {
    return this.http.put<CandidateProfileResponse>(`${this.apiUrl}/experience/${id}`, dto);
  }

  deleteExperience(id: number): Observable<CandidateProfileResponse> {
    return this.http.delete<CandidateProfileResponse>(`${this.apiUrl}/experience/${id}`);
  }

  addSkill(dto: CandidateSkillDTO): Observable<CandidateProfileResponse> {
    return this.http.post<CandidateProfileResponse>(`${this.apiUrl}/skills`, dto);
  }

  updateSkill(id: number, dto: CandidateSkillDTO): Observable<CandidateProfileResponse> {
    return this.http.put<CandidateProfileResponse>(`${this.apiUrl}/skills/${id}`, dto);
  }

  deleteSkill(id: number): Observable<CandidateProfileResponse> {
    return this.http.delete<CandidateProfileResponse>(`${this.apiUrl}/skills/${id}`);
  }
}
