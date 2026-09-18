const statusBadgeClass = {
  Reported: 'bg-secondary',
  'Under Review': 'bg-warning text-dark',
  'In Progress': 'bg-primary',
  Resolved: 'bg-success'
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

function setTableEmpty(message) {
  const tbody = document.getElementById('issuesTableBody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">${message}</td></tr>`;
}

function renderIssueTable(issues) {
  const tbody = document.getElementById('issuesTableBody');
  if (!tbody) return;

  if (!issues || issues.length === 0) {
    setTableEmpty('No issues reported yet.');
    return;
  }

  tbody.innerHTML = issues.map((issue) => {
    const badgeClass = statusBadgeClass[issue.status] || 'bg-secondary';
    return `
      <tr>
        <td>#${issue.id}</td>
        <td>${issue.category || 'N/A'}</td>
        <td>${issue.citizen_name || issue.user_id || 'Unknown citizen'}</td>
        <td>${issue.address || issue.location || 'Location unavailable'}</td>
        <td><span class="badge ${badgeClass}">${issue.status}</span></td>
        <td>${issue.created_at || 'N/A'}</td>
        <td>
          <a href="/admin/issues/${issue.id}" class="btn btn-sm btn-outline-primary">View Details</a>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadStats() {
  const totalIssuesEl = document.getElementById('totalIssues');
  const reportedEl = document.getElementById('reportedCount');
  const underReviewEl = document.getElementById('underReviewCount');
  const inProgressEl = document.getElementById('inProgressCount');
  const resolvedEl = document.getElementById('resolvedCount');

  if (!totalIssuesEl) return;

  try {
    const stats = await fetchJson('/api/admin/stats');
    totalIssuesEl.textContent = stats.total_issues ?? 0;
    reportedEl.textContent = stats.reported ?? 0;
    underReviewEl.textContent = stats.under_review ?? 0;
    inProgressEl.textContent = stats.in_progress ?? 0;
    resolvedEl.textContent = stats.resolved ?? 0;
  } catch (error) {
    totalIssuesEl.textContent = '0';
    reportedEl.textContent = '0';
    underReviewEl.textContent = '0';
    inProgressEl.textContent = '0';
    resolvedEl.textContent = '0';
  }
}

async function loadIssues() {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const categoryFilter = document.getElementById('categoryFilter');

  if (!searchInput && !statusFilter && !categoryFilter) return;

  const search = searchInput ? searchInput.value.trim() : '';
  const status = statusFilter ? statusFilter.value : '';
  const category = categoryFilter ? categoryFilter.value : '';

  let url = '/api/admin/issues';
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  if (search) params.append('search', search);

  if ([...params.keys()].length > 0) {
    url += `?${params.toString()}`;
  }

  try {
    const payload = await fetchJson(url);
    renderIssueTable(payload.issues || []);
  } catch (error) {
    setTableEmpty('No issues reported yet.');
  }
}

function initializeDashboard() {
  loadStats();
  loadIssues();

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const categoryFilter = document.getElementById('categoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', loadIssues);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', loadIssues);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', loadIssues);
  }
}

async function loadIssueDetails() {
  const container = document.getElementById('issueDetailContainer');
  if (!container) return;

  const issueId = container.dataset.issueId;
  try {
    const payload = await fetchJson(`/api/admin/issues/${issueId}`);
    const issue = payload.issue;
    if (!issue) {
      container.innerHTML = '<div class="alert alert-danger">Issue not found.</div>';
      return;
    }

    const imageUrl = issue.image_url || 'https://placehold.co/1200x800?text=No+Image+Available';
    const statusBadgeClassName = statusBadgeClass[issue.status] || 'bg-secondary';
    const locationText = issue.address || issue.location || (issue.latitude && issue.longitude ? `${issue.latitude}, ${issue.longitude}` : 'Location unavailable');

    container.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-3">
              <img src="${imageUrl}" alt="Issue image" class="issue-image" />
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p class="text-muted mb-1">Issue #${issue.id}</p>
                  <h3 class="fw-bold mb-0">${issue.category || 'General Issue'}</h3>
                </div>
                <span class="badge ${statusBadgeClassName}">${issue.status || 'Reported'}</span>
              </div>

              <div class="mb-3">
                <div class="text-muted small text-uppercase">Description</div>
                <p class="mb-0">${issue.description || 'No description provided.'}</p>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="text-muted small text-uppercase">Location</div>
                  <div>${locationText}</div>
                </div>
                <div class="col-md-6">
                  <div class="text-muted small text-uppercase">Citizen</div>
                  <div>${issue.citizen_name || issue.citizen_email || 'Unknown citizen'}</div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <div class="text-muted small text-uppercase">Created</div>
                  <div>${issue.created_at || 'N/A'}</div>
                </div>
                <div class="col-md-6">
                  <div class="text-muted small text-uppercase">Updated</div>
                  <div>${issue.updated_at || 'N/A'}</div>
                </div>
              </div>

              <div class="border-top pt-3 mt-3">
                <label for="statusSelect" class="form-label fw-semibold">Update status</label>
                <div class="d-flex gap-2 flex-wrap">
                  <select id="statusSelect" class="form-select">
                    <option value="Reported" ${issue.status === 'Reported' ? 'selected' : ''}>Reported</option>
                    <option value="Under Review" ${issue.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                    <option value="In Progress" ${issue.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Resolved" ${issue.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                  </select>
                  <button id="updateStatusBtn" class="btn btn-primary">Update</button>
                </div>
                <div id="statusMessage" class="mt-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const updateButton = document.getElementById('updateStatusBtn');
    const statusSelect = document.getElementById('statusSelect');
    const statusMessage = document.getElementById('statusMessage');

    updateButton.addEventListener('click', async () => {
      try {
        const response = await fetchJson(`/api/admin/issues/${issueId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: statusSelect.value })
        });

        statusMessage.innerHTML = `<div class="alert alert-success mb-0">${response.message}</div>`;
        const badge = document.querySelector('.badge');
        if (badge) {
          badge.className = `badge ${statusBadgeClass[statusSelect.value] || 'bg-secondary'}`;
          badge.textContent = statusSelect.value;
        }
      } catch (error) {
        statusMessage.innerHTML = `<div class="alert alert-danger mb-0">${error.message}</div>`;
      }
    });
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
  loadIssueDetails();
});
