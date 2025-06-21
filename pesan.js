// Firebase Configuration (Sama seperti di script.js)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBv31cJC19G5Aoa5LTgaeXRdpN84z5TKsY",
    authDomain: "imammulmu322.firebaseapp.com",
    projectId: "imammulmu322",
    storageBucket: "imammulmu322.firebasestorage.app",
    messagingSenderId: "1048023716189",
    appId: "1:1048023716189:web:e467f867fdd91c4ed518b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements untuk Halaman Admin
const adminContent = document.getElementById('adminContent');
const adminPassword = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const ideasGrid = document.getElementById('ideasGrid');

// Admin password
const ADMIN_PASSWORD = 'faktapopuler2024';

// Admin login
loginBtn.addEventListener('click', function() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        // Simpan status login di session storage agar tidak perlu login ulang saat refresh
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        showAdminContent();
    } else {
        alert('Password salah!');
        adminPassword.value = '';
    }
});

function showAdminContent() {
    adminContent.style.display = 'block';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    adminPassword.style.display = 'none';
    document.querySelector('.admin-controls').style.display = 'none'; // Sembunyikan form login
    document.querySelector('.admin-header').style.justifyContent = 'flex-end'; // Geser tombol logout ke kanan
    document.querySelector('.admin-header h2').style.display = 'none'; // Sembunyikan judul lama
    loadIdeas();
}

// Admin logout
logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('isAdminLoggedIn');
    location.reload(); // Muat ulang halaman untuk kembali ke state login
});

// Load ideas for admin
async function loadIdeas() {
    ideasGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Memuat ide...</p>';
    try {
        const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        ideasGrid.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const idea = doc.data();
            const ideaCard = createIdeaCard(doc.id, idea);
            ideasGrid.appendChild(ideaCard);
        });
        
        if (querySnapshot.empty) {
            ideasGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Belum ada ide yang dikirim.</p>';
        }
    } catch (error) {
        console.error('Error loading ideas:', error);
        ideasGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">Terjadi kesalahan saat memuat ide.</p>';
    }
}

// Create idea card for admin
function createIdeaCard(id, idea) {
    const card = document.createElement('div');
    card.className = 'idea-card';
    
    const createdAt = idea.createdAt ? idea.createdAt.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia';
    const statusColor = idea.status === 'approved' ? '#10b981' : idea.status === 'rejected' ? '#ef4444' : '#6366f1';
    
    card.innerHTML = `
        <div class="idea-header">
            <span class="idea-category">${idea.category}</span>
            <span class="idea-date">${createdAt}</span>
        </div>
        <h3 class="idea-title">${idea.title}</h3>
        <p class="idea-description">${idea.description}</p>
        <div class="idea-meta">
            <span><strong>Dari:</strong> ${idea.name}</span>
            <span style="color: ${statusColor}; font-weight: 600; text-transform: uppercase;">${idea.status}</span>
        </div>
        <div class="idea-meta">
            <span><strong>Email:</strong> ${idea.email}</span>
        </div>
        ${idea.sources ? `<div class="idea-meta"><span><strong>Sumber:</strong> ${idea.sources}</span></div>` : ''}
        <div class="idea-actions">
            <button class="btn btn-small btn-approve" onclick="updateIdeaStatus('${id}', 'approved')">
                <i class="fas fa-check"></i> Setujui
            </button>
            <button class="btn btn-small btn-reject" onclick="updateIdeaStatus('${id}', 'rejected')">
                <i class="fas fa-times"></i> Tolak
            </button>
        </div>
    `;
    
    return card;
}

// Update idea status (ditaruh di window object agar bisa diakses dari onclick)
window.updateIdeaStatus = async function(ideaId, status) {
    try {
        await updateDoc(doc(db, 'ideas', ideaId), {
            status: status
        });
        
        loadIdeas(); // Muat ulang ide setelah update
        
        const statusText = status === 'approved' ? 'disetujui' : 'ditolak';
        alert(`Ide berhasil ${statusText}!`);
    } catch (error) {
        console.error('Error updating idea status:', error);
        alert('Terjadi kesalahan saat mengupdate status ide.');
    }
};

// Cek jika admin sudah login sebelumnya di sesi ini
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showAdminContent();
    }
});