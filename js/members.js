let editingMemberId = null;


async function loadMembers() {

    try {

        const members = await getData("/Members");

        const tableBody =
            document.getElementById("membersTableBody");

        tableBody.innerHTML = "";

        members.forEach(member => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${member.id}</td>
                <td>${member.firstName}</td>
                <td>${member.lastName}</td>
                <td>${member.nationalCode}</td>
                <td>${member.phone ?? "-"}</td>
                <td>${formatDate(member.registerDate)}</td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn btn-edit"
                            onclick="editMember(${member.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteMember(${member.id})">
                            Delete
                        </button>

                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        showMessage(
            "Failed to load members.",
            true
        );

        console.error(error);
    }
}

//Open--Form
function openMemberForm() {

    editingMemberId = null;

    document.getElementById("formTitle").textContent =
        "Add Member";

    document.getElementById("memberForm").reset();

    document.getElementById("memberFormContainer")
        .classList.remove("hidden");
}
//Close--Form
function closeMemberForm() {

    document.getElementById("memberFormContainer")
        .classList.add("hidden");

    editingMemberId = null;
}

//Add/Update--Member
document.getElementById("memberForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const member = {

            firstName:
                document.getElementById("firstName").value,

            lastName:
                document.getElementById("lastName").value,

            nationalCode:
                document.getElementById("nationalCode").value,

            phone:
                document.getElementById("phone").value || null
        };


        try {

            if (editingMemberId === null) {

                await postData("/Members", member);

                showMessage(
                    "Member added successfully."
                );

            } else {

                await putData(
                    `/Members/${editingMemberId}`,
                    member
                );

                showMessage(
                    "Member updated successfully."
                );
            }

            closeMemberForm();

            await loadMembers();

        } catch (error) {

            showMessage(
                error.message,
                true
            );

            console.error(error);
        }

    });

    //Edit--Member
    async function editMember(id) {

    try {

        const member =
            await getData(`/Members/${id}`);

        editingMemberId = id;

        document.getElementById("formTitle").textContent =
            "Edit Member";

        document.getElementById("firstName").value =
            member.firstName;

        document.getElementById("lastName").value =
            member.lastName;

        document.getElementById("nationalCode").value =
            member.nationalCode;

        document.getElementById("phone").value =
            member.phone ?? "";

        document.getElementById("memberFormContainer")
            .classList.remove("hidden");

    } catch (error) {

        showMessage(
            "Failed to load member.",
            true
        );

        console.error(error);
    }
}

//DELETE--Member
async function deleteMember(id) {

    const confirmed =
        confirm("Are you sure you want to delete this member?");

    if (!confirmed)
        return;


    try {

        await deleteData(`/Members/${id}`);

        showMessage(
            "Member deleted successfully."
        );

        await loadMembers();

    } catch (error) {

        showMessage(
            error.message,
            true
        );

        console.error(error);
    }
}
//DateFormatting
function formatDate(dateString) {

    if (!dateString)
        return "-";

    return new Date(dateString)
        .toLocaleDateString();
}

function showMessage(message, isError = false) {

    const element =
        document.getElementById("message");

    element.textContent = message;

    element.style.color =
        isError ? "#dc2626" : "#16a34a";

    setTimeout(() => {

        element.textContent = "";

    }, 3000);
}

loadMembers();