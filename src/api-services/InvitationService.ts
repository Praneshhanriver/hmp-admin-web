import { apiClient, request } from "@/api-services/apiClient";
import type {
  Invitation,
  InvitationDetail,
  InvitationFormValues,
  InvitationListParams,
  PageResult,
} from "@/types/invitation";
import { API_ENDPOINTS } from "@/utils/api-integration";

// The only file that calls the invitation API. Hooks call these; components call the hooks
export const InvitationService = {
  // List with search, status filter and paging, all done by the server
  getList({ query, status, page, size }: InvitationListParams): Promise<PageResult<Invitation>> {
    return request(
      apiClient.get<PageResult<Invitation>>(API_ENDPOINTS.INVITATIONS, {
        params: {
          keyword: query.trim() || undefined,
          status: status === "all" ? undefined : status,
          page,
          size,
        },
      }),
    );
  },

  getDetail(id: number): Promise<InvitationDetail> {
    return request(apiClient.get<InvitationDetail>(API_ENDPOINTS.INVITATION(id)));
  },

  create(values: InvitationFormValues): Promise<InvitationDetail> {
    return request(apiClient.post<InvitationDetail>(API_ENDPOINTS.INVITATIONS, values));
  },

  // Pending only: saves the corrected details and sends a corrected link
  update(id: number, values: InvitationFormValues): Promise<InvitationDetail> {
    return request(apiClient.put<InvitationDetail>(API_ENDPOINTS.INVITATION(id), values));
  },

  reissue(id: number): Promise<InvitationDetail> {
    return request(apiClient.post<InvitationDetail>(API_ENDPOINTS.INVITATION_REISSUE(id)));
  },

  // Delete = revoke: the link stops working, the row stays in the list as Revoked
  remove(id: number): Promise<InvitationDetail> {
    return request(apiClient.delete<InvitationDetail>(API_ENDPOINTS.INVITATION(id)));
  },
};
