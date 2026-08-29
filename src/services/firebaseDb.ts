// Minimal helper to keep codebase clean and prevent unwanted database writes.
// All client data is uploaded directly to Google Drive upon submission and nothing is stored in the portal.
export async function clearPortalStorage() {
  try {
    localStorage.removeItem('ring2rev_all_submissions');
    localStorage.removeItem('ring2rev_submissions_history');
    sessionStorage.removeItem('ring2rev_admin_auth');
  } catch {}
}
