export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TenderPortalType = 'gem' | 'cppp' | 'state_portal' | 'custom';
export type TenderStatus = 'active' | 'archived' | 'cancelled' | 'awarded';
export type PipelineStage = 
  | 'discovered' 
  | 'under_review' 
  | 'bid_drafting' 
  | 'compliance_passed' 
  | 'submitted' 
  | 'won' 
  | 'lost' 
  | 'passed';
export type ComplianceStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
export type UserRole = 'owner' | 'admin' | 'bid_manager' | 'viewer';

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          pan_number: string | null;
          gstin: string | null;
          website: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          pan_number?: string | null;
          gstin?: string | null;
          website?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          legal_name?: string | null;
          pan_number?: string | null;
          gstin?: string | null;
          website?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          phone_number: string;
          role: UserRole;
          whatsapp_notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          phone_number: string;
          role?: UserRole;
          whatsapp_notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          full_name?: string;
          email?: string;
          phone_number?: string;
          role?: UserRole;
          whatsapp_notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_icps: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          target_categories: string[];
          min_tender_value: number;
          max_tender_value: number | null;
          preferred_states: string[];
          excluded_keywords: string[];
          required_certifications: string[];
          min_annual_turnover: number | null;
          max_emd_capacity: number | null;
          icp_summary: string | null;
          embedding: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title?: string;
          target_categories?: string[];
          min_tender_value?: number;
          max_tender_value?: number | null;
          preferred_states?: string[];
          excluded_keywords?: string[];
          required_certifications?: string[];
          min_annual_turnover?: number | null;
          max_emd_capacity?: number | null;
          icp_summary?: string | null;
          embedding?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          target_categories?: string[];
          min_tender_value?: number;
          max_tender_value?: number | null;
          preferred_states?: string[];
          excluded_keywords?: string[];
          required_certifications?: string[];
          min_annual_turnover?: number | null;
          max_emd_capacity?: number | null;
          icp_summary?: string | null;
          embedding?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenders: {
        Row: {
          id: string;
          portal: TenderPortalType;
          tender_ref_number: string;
          title: string;
          description: string | null;
          category: string;
          authority_name: string;
          location_state: string | null;
          location_city: string | null;
          estimated_value: number | null;
          emd_amount: number | null;
          document_fee: number | null;
          published_date: string;
          pre_bid_meeting_date: string | null;
          submission_deadline: string;
          opening_date: string | null;
          original_document_urls: Json;
          raw_payload: Json;
          embedding: string | null;
          status: TenderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portal?: TenderPortalType;
          tender_ref_number: string;
          title: string;
          description?: string | null;
          category: string;
          authority_name: string;
          location_state?: string | null;
          location_city?: string | null;
          estimated_value?: number | null;
          emd_amount?: number | null;
          document_fee?: number | null;
          published_date: string;
          pre_bid_meeting_date?: string | null;
          submission_deadline: string;
          opening_date?: string | null;
          original_document_urls?: Json;
          raw_payload?: Json;
          embedding?: string | null;
          status?: TenderStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portal?: TenderPortalType;
          tender_ref_number?: string;
          title?: string;
          description?: string | null;
          category?: string;
          authority_name?: string;
          location_state?: string | null;
          location_city?: string | null;
          estimated_value?: number | null;
          emd_amount?: number | null;
          document_fee?: number | null;
          published_date?: string;
          pre_bid_meeting_date?: string | null;
          submission_deadline?: string;
          opening_date?: string | null;
          original_document_urls?: Json;
          raw_payload?: Json;
          embedding?: string | null;
          status?: TenderStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      tender_matches: {
        Row: {
          id: string;
          company_id: string;
          tender_id: string;
          overall_score: number;
          semantic_score: number;
          rule_score: number;
          match_reasons: Json;
          disqualification_risks: Json;
          ai_summary: Json;
          whatsapp_status: NotificationStatus;
          whatsapp_message_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tender_id: string;
          overall_score: number;
          semantic_score: number;
          rule_score: number;
          match_reasons?: Json;
          disqualification_risks?: Json;
          ai_summary?: Json;
          whatsapp_status?: NotificationStatus;
          whatsapp_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tender_id?: string;
          overall_score?: number;
          semantic_score?: number;
          rule_score?: number;
          match_reasons?: Json;
          disqualification_risks?: Json;
          ai_summary?: Json;
          whatsapp_status?: NotificationStatus;
          whatsapp_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipeline_items: {
        Row: {
          id: string;
          company_id: string;
          tender_id: string;
          stage: PipelineStage;
          internal_notes: string | null;
          assigned_user_id: string | null;
          bid_value: number | null;
          target_submission_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tender_id: string;
          stage?: PipelineStage;
          internal_notes?: string | null;
          assigned_user_id?: string | null;
          bid_value?: number | null;
          target_submission_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tender_id?: string;
          stage?: PipelineStage;
          internal_notes?: string | null;
          assigned_user_id?: string | null;
          bid_value?: number | null;
          target_submission_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bid_compliance_reviews: {
        Row: {
          id: string;
          company_id: string;
          tender_id: string;
          uploaded_by: string | null;
          document_filename: string;
          document_url: string;
          extracted_text_summary: string | null;
          overall_compliance_score: number | null;
          checklist: Json;
          missing_items: Json;
          recommendations: Json;
          status: ComplianceStatus;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tender_id: string;
          uploaded_by?: string | null;
          document_filename: string;
          document_url: string;
          extracted_text_summary?: string | null;
          overall_compliance_score?: number | null;
          checklist?: Json;
          missing_items?: Json;
          recommendations?: Json;
          status?: ComplianceStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tender_id?: string;
          uploaded_by?: string | null;
          document_filename?: string;
          document_url?: string;
          extracted_text_summary?: string | null;
          overall_compliance_score?: number | null;
          checklist?: Json;
          missing_items?: Json;
          recommendations?: Json;
          status?: ComplianceStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      whatsapp_logs: {
        Row: {
          id: string;
          company_id: string | null;
          tender_id: string | null;
          phone_number: string;
          direction: 'inbound' | 'outbound';
          message_type: string;
          payload: Json;
          status: NotificationStatus;
          external_message_id: string | null;
          error_details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          tender_id?: string | null;
          phone_number: string;
          direction: 'inbound' | 'outbound';
          message_type: string;
          payload?: Json;
          status?: NotificationStatus;
          external_message_id?: string | null;
          error_details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          tender_id?: string | null;
          phone_number?: string;
          direction?: 'inbound' | 'outbound';
          message_type?: string;
          payload?: Json;
          status?: NotificationStatus;
          external_message_id?: string | null;
          error_details?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      match_tenders_for_icp: {
        Args: {
          p_company_id: string;
          p_match_threshold: number;
          p_match_count: number;
        };
        Returns: {
          tender_id: string;
          tender_ref_number: string;
          title: string;
          category: string;
          authority_name: string;
          estimated_value: number;
          submission_deadline: string;
          similarity_score: number;
        }[];
      };
    };
  };
}
