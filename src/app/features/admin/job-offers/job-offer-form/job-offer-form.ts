import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { JobOfferService } from '../../../../core/services/job-offer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { JobType, SkillLevel, WorkModel } from '../../../../models/enums';

@Component({
  selector: 'app-job-offer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './job-offer-form.html',
  styleUrl: './job-offer-form.css',
})
export class JobOfferForm implements OnInit {
private readonly fb = inject(FormBuilder);
  private readonly jobService = inject(JobOfferService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  isEdit = signal(false);
  saving = signal(false);
  editId = 0;

  jobTypes = Object.values(JobType);
  workModels = Object.values(WorkModel);
  skillLevels = Object.values(SkillLevel);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    type: [JobType.FULL_TIME],
    workModel: [WorkModel.REMOTE],
    salaryRange: [''],
    location: [''],
    requiredEducation: [''],
    requiredExperience: [''],
    requiredSkills: this.fb.array<ReturnType<typeof this.createSkillGroup>>([]),
  });

  get skillsArray(): FormArray {
    return this.form.controls.requiredSkills;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId = Number(id);
      this.jobService.getJobOfferById(this.editId).subscribe({
        next: (job) => {
          this.form.patchValue({
            title: job.title,
            description: job.description,
            type: job.type,
            workModel: job.workModel,
            salaryRange: job.salaryRange,
            location: job.location,
            requiredEducation: job.requiredEducation,
            requiredExperience: job.requiredExperience,
          });
          job.requiredSkills.forEach((s) => {
            this.skillsArray.push(this.createSkillGroup(s.name, s.minimumLevel));
          });
        },
        error: () => this.toast.error('Failed to load job offer'),
      });
    }
  }

  createSkillGroup(name = '', level: SkillLevel = SkillLevel.INTERMEDIATE) {
    return this.fb.nonNullable.group({
      name: [name, Validators.required],
      minimumLevel: [level],
    });
  }

  addSkill(): void {
    this.skillsArray.push(this.createSkillGroup());
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const data = this.form.getRawValue();
    const obs = this.isEdit()
      ? this.jobService.updateJobOffer(this.editId, data)
      : this.jobService.createJobOffer(data);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.isEdit() ? 'Job offer updated' : 'Job offer created');
        this.router.navigate(['/admin/job-offers']);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to save job offer');
      },
    });
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }
}
