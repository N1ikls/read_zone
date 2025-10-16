export interface FormReportType {
  reason?: string;
  comment?: string;
}

export interface FormReportTypeWithGuid extends FormReportType {
  id: string;
}
