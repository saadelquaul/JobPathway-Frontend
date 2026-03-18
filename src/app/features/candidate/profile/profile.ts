import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner-component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog-component';
import { DatePipe } from '@angular/common';
import { CandidateService } from '../../../core/services/candidate.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { CandidateProfileResponse, CandidateProfileUpdateRequest, CandidateSkillDTO, EducationDTO, ExperienceDTO } from '../../../models/candidate.models';
import { SkillLevel } from '../../../models/enums';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, ConfirmDialogComponent, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit{

  private readonly candidateService = inject(CandidateService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  profile = signal<CandidateProfileResponse | null>(null);
  editingProfile = signal(false);
  selectedResumeFile = signal<File | null>(null);
  uploadingResume = signal(false);

  showEdModal = signal(false);
  editingEdId = signal<number | null>(null);
  showExpModal = signal(false);
  editingExpId = signal<number | null>(null);
  showSkillModal = signal(false);
  editingSkillId = signal<number | null>(null);

  showDeleteConfirm = signal(false);
  deleteAction = signal<(() => void) | null>(null);

  skillLevels = Object.values(SkillLevel);

  profileForm = this.fb.nonNullable.group({
    name: [''],
    summary: [''],
    portfolioUrl: [''],
  });

  edForm = this.fb.nonNullable.group({
    schoolName: ['', Validators.required],
    degree: [''],
    field: [''],
    startDate: [''],
    endDate: [''],
  });

  expForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    companyName: [''],
    location: [''],
    startDate: [''],
    endDate: [''],
    isCurrent: [false],
    description: [''],
  });

  skillForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    level: [SkillLevel.INTERMEDIATE as SkillLevel],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.candidateService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileForm.patchValue({
          name: data.name,
          summary: data.summary,
          portfolioUrl: data.portfolioUrl,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load profile');
      },
    });
  }

  onResumeFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedResumeFile.set(file);
  }

  saveProfile(): void {
    const file = this.selectedResumeFile();
    if (file) {
      this.uploadingResume.set(true);
      this.candidateService.uploadResume(file).subscribe({
        next: ({ url }) => {
          this.uploadingResume.set(false);
          this.selectedResumeFile.set(null);
          this.doUpdateProfile(url);
        },
        error: () => {
          this.uploadingResume.set(false);
          this.toast.error('Failed to upload resume');
        },
      });
    } else {
      this.doUpdateProfile();
    }
  }

  private doUpdateProfile(resumeUrl?: string): void {
    const data: CandidateProfileUpdateRequest = this.profileForm.getRawValue();
    if (resumeUrl !== undefined) data.resumeUrl = resumeUrl;
    this.candidateService.updateProfile(data).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.editingProfile.set(false);
        this.toast.success('Profile updated');
      },
      error: () => this.toast.error('Failed to update profile'),
    });
  }

  openEdModal(edu?: EducationDTO): void {
    if (edu) {
      this.editingEdId.set(edu.id!);
      this.edForm.patchValue(edu);
    } else {
      this.editingEdId.set(null);
      this.edForm.reset();
    }
    this.showEdModal.set(true);
  }

  saveEducation(): void {
    if (this.edForm.invalid) { this.edForm.markAllAsTouched(); return; }
    const dto = this.edForm.getRawValue() as EducationDTO;
    const id = this.editingEdId();
    const obs = id ? this.candidateService.updateEducation(id, dto) : this.candidateService.addEducation(dto);
    obs.subscribe({
      next: () => {
        this.loadProfile();
        this.showEdModal.set(false);
        this.toast.success(id ? 'Education updated' : 'Education added');
      },
      error: () => this.toast.error('Failed to save education'),
    });
  }

  confirmDeleteEd(id: number): void {
    this.deleteAction.set(() => {
      this.candidateService.deleteEducation(id).subscribe({
        next: () => {
          this.loadProfile();
          this.toast.success('Education deleted');
        },
        error: () => this.toast.error('Failed to delete'),
      });
    });
    this.showDeleteConfirm.set(true);
  }

  openExpModal(exp?: ExperienceDTO): void {
    if (exp) {
      this.editingExpId.set(exp.id!);
      this.expForm.patchValue({ ...exp, endDate: exp.endDate ?? '' });
    } else {
      this.editingExpId.set(null);
      this.expForm.reset();
    }
    this.showExpModal.set(true);
  }

  saveExperience(): void {
    if (this.expForm.invalid) { this.expForm.markAllAsTouched(); return; }
    const dto = this.expForm.getRawValue() as ExperienceDTO;
    const id = this.editingExpId();
    const obs = id ? this.candidateService.updateExperience(id, dto) : this.candidateService.addExperience(dto);
    obs.subscribe({
      next: () => {
        this.loadProfile();
        this.showExpModal.set(false);
        this.toast.success(id ? 'Experience updated' : 'Experience added');
      },
      error: () => this.toast.error('Failed to save experience'),
    });
  }

  confirmDeleteExp(id: number): void {
    this.deleteAction.set(() => {
      this.candidateService.deleteExperience(id).subscribe({
        next: () => {
          this.loadProfile();
          this.toast.success('Experience deleted');
        },
        error: () => this.toast.error('Failed to delete'),
      });
    });
    this.showDeleteConfirm.set(true);
  }

  openSkillModal(skill?: CandidateSkillDTO): void {
    if (skill) {
      this.editingSkillId.set(skill.id!);
      this.skillForm.patchValue(skill);
    } else {
      this.editingSkillId.set(null);
      this.skillForm.reset({ name: '', level: SkillLevel.INTERMEDIATE });
    }
    this.showSkillModal.set(true);
  }

  saveSkill(): void {
    if (this.skillForm.invalid) { this.skillForm.markAllAsTouched(); return; }
    const dto = this.skillForm.getRawValue() as CandidateSkillDTO;
    const id = this.editingSkillId();
    const obs = id ? this.candidateService.updateSkill(id, dto) : this.candidateService.addSkill(dto);
    obs.subscribe({
      next: () => {
        this.loadProfile();
        this.showSkillModal.set(false);
        this.toast.success(id ? 'Skill updated' : 'Skill added');
      },
      error: () => this.toast.error('Failed to save skill'),
    });
  }

  confirmDeleteSkill(id: number): void {
    this.deleteAction.set(() => {
      this.candidateService.deleteSkill(id).subscribe({
        next: () => {
          this.loadProfile();
          this.toast.success('Skill deleted');
        },
        error: () => this.toast.error('Failed to delete'),
      });
    });
    this.showDeleteConfirm.set(true);
  }

  executeDelete(): void {
    const action = this.deleteAction();
    if (action) action();
    this.showDeleteConfirm.set(false);
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }
}
