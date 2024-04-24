import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from 'src/app/core/services/auth.guard';

import { SourceSystemComponent } from './components/source-system/source-system.component';
import { ImportedHistoryComponent } from './components/source-system/imported-history/imported-history.component';
import { SourceSystemMappingComponent } from './components/source-system/source-system-mapping/source-system-mapping.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { SchedulerCreateComponent } from './components/scheduler/scheduler-create/scheduler-create.component';
import { SchedularHistoryComponent } from './components/scheduler/schedular-history/schedular-history.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { AdvanceAuditLogSearchComponent } from './components/audit-log/advance-audit-log-search/advance-audit-log-search.component';
import { ExtensionComponent } from './components/audit-log/extension/extension.component';

const routes: Routes = [
  { path: 'source-system', component: SourceSystemComponent, canActivate: [AuthGuard] },
  { path: 'source-system/imported-history', component: ImportedHistoryComponent, canActivate: [AuthGuard] },

  { path: 'source-system/config', component: SourceSystemMappingComponent, canActivate: [AuthGuard] },
  { path: 'source-system/config/:source_system_uuid', component: SourceSystemMappingComponent, canActivate: [AuthGuard] },

  { path: 'scheduler', component: SchedulerComponent, canActivate: [AuthGuard] },
  { path: 'scheduler/create', component: SchedulerCreateComponent, canActivate: [AuthGuard] },
  { path: 'scheduler/:scheduler_id', component: SchedulerCreateComponent, canActivate: [AuthGuard] },
  { path: 'scheduler/:scheduler_id/history', component: SchedularHistoryComponent, canActivate: [AuthGuard] },
  { path: 'scheduler/:scheduler_id/history/:history_id/audit-log', component: AuditLogComponent, canActivate: [AuthGuard] },
  { path: 'source-system/imported-history/:import_id/audit-log', component: AuditLogComponent, canActivate: [AuthGuard] },

  { path: 'audit-log', component: AuditLogComponent, canActivate: [AuthGuard] },
  { path: 'audit-log/advance-search', component: AdvanceAuditLogSearchComponent, canActivate: [AuthGuard] },
  { path: 'audit-log/:id/details', component: ExtensionComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'source-system', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatasetupModulePageRoutingModule { }
