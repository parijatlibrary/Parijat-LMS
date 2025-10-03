document.addEventListener('DOMContentLoaded', () => {
    // --- YOUR NEW, WORKING URL HAS BEEN ADDED HERE ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpxzq300ycdcAvR1gacrqsfZ4SXVSR2dq-PM57VrT09PEunf9pHI_M4NeJP5Lt_LuJ/exec";

    const ADMIN_EMAIL = "libraryparijat@gmail.com";
    const ADMIN_PASSWORD = "Adminp@2025";

    // --- Page and Element References ---
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const loader = document.getElementById('loader');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const totalBooksEl = document.getElementById('total-books');
    const issuedBooksEl = document.getElementById('issued-books');
    const totalMembersEl = document.getElementById('total-members');
    const addBookForm = document.getElementById('add-book-form');
    const addMemberForm = document.getElementById('add-member-form');
    const issueBookForm = document.getElementById('issue-book-form');
    const booksTableBody = document.querySelector('#books-table tbody');
    const membersTableBody = document.querySelector('#members-table tbody');
    const issuedTableBody = document.querySelector('#issued-books-table tbody');
    const issueBookSelect = document.getElementById('issue-book-select');
    const issueMemberSelect = document.getElementById('issue-member-select');
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const editForm = document.getElementById('edit-form');
    const closeModalBtn = document.querySelector('.close-button');
    const searchBooksInput = document.getElementById('search-books');
    const searchMembersInput = document.getElementById('search-members');
    const searchIssuedInput = document.getElementById('search-issued');
    let allBooks = [], allMembers = [], allIssuedBooks = [];

    const showLoader = (show) => { loader.style.display = show ? 'flex' : 'none'; };

    const fetchData = async (action) => {
        showLoader(true);
        try {
            const response = await fetch(`${SCRIPT_URL}?action=${action}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${action}:`, error);
            alert(`Failed to fetch data. Please check your connection and script URL.`);
            return [];
        } finally { showLoader(false); }
    };
    
    const postData = async (data) => {
        showLoader(true);
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'omit',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data), redirect: 'follow',
            });
            const result = await response.json();
            if (result.status !== 'success') { throw new Error(result.message || 'An unknown error occurred.'); }
            return result;
        } catch (error) {
            console.error('Error posting data:', error);
            alert(`Operation failed: Failed to fetch`); // Simplified for clarity
            return null;
        } finally { showLoader(false); }
    };

    const renderBooks = (booksToRender) => {
        booksTableBody.innerHTML = '';
        booksToRender.forEach(book => {
            const statusClass = book.Status === 'Available' ? 'status-available' : 'status-issued';
            booksTableBody.insertAdjacentHTML('beforeend', `<tr><td data-label="Book ID">${book.BookID}</td><td data-label="Title">${book.Title}</td><td data-label="Author">${book.Author}</td><td data-label="Genre">${book.Genre}</td><td data-label="Status"><span class="${statusClass}">${book.Status}</span></td><td data-label="Actions"><button class="action-btn edit-btn" data-id="${book.BookID}" data-type="book">Edit</button><button class="action-btn delete-btn" data-id="${book.BookID}" data-type="book">Delete</button></td></tr>`);
        });
    };
    const renderMembers = (m) => { membersTableBody.innerHTML = ''; m.forEach(i => membersTableBody.insertAdjacentHTML('beforeend', `<tr><td data-label="Member ID">${i.MemberID}</td><td data-label="Name">${i.Name}</td><td data-label="Contact">${i.Contact}</td><td data-label="Actions"><button class="action-btn edit-btn" data-id="${i.MemberID}" data-type="member">Edit</button><button class="action-btn delete-btn" data-id="${i.MemberID}" data-type="member">Delete</button></td></tr>`));};
    const renderIssuedBooks = (i) => { issuedTableBody.innerHTML = ''; i.forEach(item => { const isR = item.Status === 'Returned'; const sC = isR ? 'status-returned':'status-issued'; issuedTableBody.insertAdjacentHTML('beforeend', `<tr><td data-label="Issue ID">${item.IssueID}</td><td data-label="Book Title">${item.BookTitle}</td><td data-label="Member Name">${item.MemberName}</td><td data-label="Issue Date">${item.IssueDate}</td><td data-label="Due Date">${item.DueDate}</td><td data-label="Status"><span class="${sC}">${item.Status}</span></td><td data-label="Action">${!isR ? `<button class="action-btn return-btn" data-issue-id="${item.IssueID}" data-book-id="${item.BookID}">Return</button>` : 'Returned'}</td></tr>`);});};
    const updateStats = () => { totalBooksEl.textContent = allBooks.length; issuedBooksEl.textContent = allBooks.filter(b=>b.Status==='Issued').length; totalMembersEl.textContent = allMembers.length; };
    const populateIssueDropdowns = () => { issueBookSelect.innerHTML = '<option value="">Select a Book</option>'; allBooks.filter(b=>b.Status==='Available').forEach(b => {issueBookSelect.innerHTML += `<option value="${b.BookID}" data-title="${b.Title}">${b.Title} (${b.Author}) - ${b.BookID}</option>`;}); issueMemberSelect.innerHTML = '<option value="">Select a Member</option>'; allMembers.forEach(m => {issueMemberSelect.innerHTML += `<option value="${m.MemberID}" data-name="${m.Name}">${m.Name}</option>`;});};

    const loadAllData = async () => {
        [allBooks, allMembers, allIssuedBooks] = await Promise.all([fetchData('getBooks'), fetchData('getMembers'), fetchData('getIssuedBooks')]);
        renderBooks(allBooks); renderMembers(allMembers); renderIssuedBooks(allIssuedBooks);
        updateStats(); populateIssueDropdowns();
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('admin-email').value === ADMIN_EMAIL && document.getElementById('admin-password').value === ADMIN_PASSWORD) {
            loginPage.classList.remove('active'); dashboardPage.classList.add('active');
            sessionStorage.setItem('loggedIn', 'true'); loadAllData();
        } else { loginError.textContent = "Invalid email or password."; }
    });

    logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('loggedIn'); location.reload(); });
    
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('book-title').value;
        const author = document.getElementById('book-author').value;
        const genre = document.getElementById('book-genre').value;
        const copies = document.getElementById('book-copies').value;
        
        const result = await postData({ action: 'addBook', title, author, genre, copies });
        if (result) {
            alert(`${copies} cop(y/ies) of the book added successfully!`);
            addBookForm.reset();
            loadAllData();
        }
    });

    addMemberForm.addEventListener('submit', async (e) => { e.preventDefault(); const result = await postData({ action: 'addMember', name: document.getElementById('member-name').value, contact: document.getElementById('member-contact').value }); if(result) { alert('Member added successfully!'); addMemberForm.reset(); loadAllData(); } });
    issueBookForm.addEventListener('submit', async (e) => { e.preventDefault(); const bookId = issueBookSelect.value; const memberId = issueMemberSelect.value; if (!bookId || !memberId) { alert('Please select both a book and a member.'); return; } const bookTitle = issueBookSelect.options[issueBookSelect.selectedIndex].dataset.title; const memberName = issueMemberSelect.options[issueMemberSelect.selectedIndex].dataset.name; const result = await postData({ action: 'issueBook', bookId, memberId, bookTitle, memberName }); if(result) { alert('Book issued successfully!'); issueBookForm.reset(); loadAllData(); } });
    document.querySelector('main').addEventListener('click', async (e) => { const target = e.target; if (target.classList.contains('delete-btn')) { const id = target.dataset.id; const type = target.dataset.type; const action = type === 'book' ? 'deleteBook' : 'deleteMember'; if (confirm(`Are you sure you want to delete this ${type}?`)) { const result = await postData({ action, id }); if(result) { alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`); loadAllData(); } } } if (target.classList.contains('return-btn')) { const issueId = target.dataset.issueId; const bookId = target.dataset.bookId; if(confirm('Are you sure you want to mark this book as returned?')){ const result = await postData({ action: 'returnBook', issueId, bookId }); if (result) { alert('Book returned successfully!'); loadAllData(); } } } if(target.classList.contains('edit-btn')) { openEditModal(target.dataset.type, target.dataset.id); } });
    const openEditModal = (type, id) => { modal.style.display = 'block'; editForm.innerHTML = ''; editForm.dataset.type = type; editForm.dataset.id = id; if (type === 'book') { const book = allBooks.find(b => b.BookID === id); modalTitle.textContent = 'Edit Book'; editForm.innerHTML = `<input type="text" id="edit-title" value="${book.Title}" required><input type="text" id="edit-author" value="${book.Author}" required><input type="text" id="edit-genre" value="${book.Genre}" required><button type="submit">Save Changes</button>`; } else if (type === 'member') { const member = allMembers.find(m => m.MemberID === id); modalTitle.textContent = 'Edit Member'; editForm.innerHTML = `<input type="text" id="edit-name" value="${member.Name}" required><input type="text" id="edit-contact" value="${member.Contact}" required><button type="submit">Save Changes</button>`; } };
    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) { modal.style.display = "none"; } };
    editForm.addEventListener('submit', async (e) => { e.preventDefault(); const type = e.target.dataset.type; const id = e.target.dataset.id; let updates = {}, action = ''; if (type === 'book') { action = 'updateBook'; updates = { Title: document.getElementById('edit-title').value, Author: document.getElementById('edit-author').value, Genre: document.getElementById('edit-genre').value }; } else if (type === 'member') { action = 'updateMember'; updates = { Name: document.getElementById('edit-name').value, Contact: document.getElementById('edit-contact').value }; } const result = await postData({ action, id, updates }); if(result) { alert('Updated successfully!'); modal.style.display = 'none'; loadAllData(); } });
    const filterTable = (input, data, renderFn, keys) => { const searchTerm = input.value.toLowerCase(); const filteredData = data.filter(item => { return keys.some(key => item[key] && item[key].toString().toLowerCase().includes(searchTerm)); }); renderFn(filteredData); };
    searchBooksInput.addEventListener('input', () => filterTable(searchBooksInput, allBooks, renderBooks, ['BookID', 'Title', 'Author', 'Genre']));
    searchMembersInput.addEventListener('input', () => filterTable(searchMembersInput, allMembers, renderMembers, ['MemberID', 'Name']));
    searchIssuedInput.addEventListener('input', () => filterTable(searchIssuedInput, allIssuedBooks, renderIssuedBooks, ['BookTitle', 'MemberName', 'IssueID']));

    if (sessionStorage.getItem('loggedIn') === 'true') { loginPage.classList.remove('active'); dashboardPage.classList.add('active'); loadAllData(); } else { loginPage.classList.add('active'); dashboardPage.classList.remove('active'); }
});
function openTab(evt, tabName) { let i, tabcontent, tablinks; tabcontent = document.getElementsByClassName("tab-content"); for (i = 0; i < tabcontent.length; i++) { tabcontent[i].classList.remove("active"); } tablinks = document.getElementsByClassName("tab-link"); for (i = 0; i < tablinks.length; i++) { tablinks[i].classList.remove("active"); } document.getElementById(tabName).classList.add("active"); evt.currentTarget.classList.add("active");}
