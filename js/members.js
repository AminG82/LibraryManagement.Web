let editingMemberId = null;
const memberFormModal = document.getElementById('memberFormModal');
const memberForm = document.getElementById('memberForm');
const membersTableBody = document.getElementById('membersTableBody');
const membersEmptyState = document.getElementById('membersEmptyState');
const memberFormTitle = document.getElementById('memberFormTitle');
const memberFormSubmitText = document.getElementById('memberFormSubmitText');


async function loadMembers() {
    try {
        const members = await getData('/Members');
        renderMembersTable(members);
    } catch (error) {
        showMessage('Failed to load members.', true);
        console.error(error);
    }
}

function renderMembersTable(members) {
    membersTableBody.innerHTML = '';

    if (members.length === 0) {
        membersTableBody.style.display = 'none';
        membersEmptyState.classList.remove('hidden');
        membersEmptyState.setAttribute('aria-hidden', 'false');
        return;
    }

    membersTableBody.style.display = '';
    membersEmptyState.classList.add('hidden');
    membersEmptyState.setAttribute('aria-hidden', 'true');

    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${escapeHtml(member.firstName)}</td>
            <td>${escapeHtml(member.lastName)}</td>
            <td><code style="font-size: var(--text-sm);">${escapeHtml(member.nationalCode)}</code></td>
            <td class="table__cell--muted">${escapeHtml(member.phone ?? '—')}</td>
            <td class="table__cell--muted">${formatDate(member.registerDate)}</td>
            <td>
                <div class="table__actions">
                    <button class="btn btn--ghost btn--sm btn-edit" onclick="editMember(${member.id})" aria-label="Edit ${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)}">
                        <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn btn--ghost btn--sm btn-danger" onclick="deleteMember(${member.id})" aria-label="Delete ${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)}">
                        <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        membersTableBody.appendChild(row);
    });
}

function openMemberForm() {
    editingMemberId = null;
    memberFormTitle.textContent = 'Add Member';
    memberFormSubmitText.textContent = 'Save';
    memberForm.reset();
    memberFormModal.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('firstName').focus(), 100);
}

function closeMemberForm() {
    memberFormModal.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    editingMemberId = null;
}

memberForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const member = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        nationalCode: document.getElementById('nationalCode').value.trim(),
        phone: document.getElementById('phone').value.trim() || null
    };

    if (!member.firstName || !member.lastName || !member.nationalCode) {
        showMessage('Please fill in all required fields.', true);
        return;
    }

    if (member.nationalCode.length !== 10 || !/^\d{10}$/.test(member.nationalCode)) {
        showMessage('National Code must be exactly 10 digits.', true);
        return;
    }

    try {
        if (editingMemberId === null) {
            await postData('/Members', member);
            showMessage('Member added successfully.');
        } else {
            await putData(`/Members/${editingMemberId}`, member);
            showMessage('Member updated successfully.');
        }

        closeMemberForm();
        await loadMembers();
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
});

async function editMember(id) {
    try {
        const member = await getData(`/Members/${id}`);
        editingMemberId = id;
        memberFormTitle.textContent = 'Edit Member';
        memberFormSubmitText.textContent = 'Update';
        document.getElementById('firstName').value = member.firstName;
        document.getElementById('lastName').value = member.lastName;
        document.getElementById('nationalCode').value = member.nationalCode;
        document.getElementById('phone').value = member.phone ?? '';
        memberFormModal.classList.add('modal-overlay--open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('firstName').focus(), 100);
    } catch (error) {
        showMessage('Failed to load member.', true);
        console.error(error);
    }
}

async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
        await deleteData(`/Members/${id}`);
        showMessage('Member deleted successfully.');
        await loadMembers();
    } catch (error) {
        showMessage(error.message, true);
        console.error(error);
    }
}

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
}

function showMessage(message, isError = false) {
    const element = document.getElementById('message');
    element.textContent = message;
    element.className = 'alert ' + (isError ? 'alert--error' : 'alert--success');
    element.classList.remove('alert--hidden');

    setTimeout(() => {
        element.classList.add('alert--hidden');
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

memberFormModal.addEventListener('click', (e) => {
    if (e.target === memberFormModal) closeMemberForm();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && memberFormModal.classList.contains('modal-overlay--open')) {
        closeMemberForm();
    }
});

loadMembers();