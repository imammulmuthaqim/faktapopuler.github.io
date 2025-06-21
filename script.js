// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';

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

// DOM Elements
const ideaForm = document.getElementById('ideaForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const successModal = document.getElementById('successModal');
const closeModal = document.getElementById('closeModal');
const adminSection = document.getElementById('admin');
const adminContent = document.getElementById('adminContent');
const adminPassword = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const ideasGrid = document.getElementById('ideasGrid');

// Admin password (in production, use proper authentication)
const ADMIN_PASSWORD = 'faktapopuler2024';

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
});

// Form submission
ideaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading overlay
    loadingOverlay.style.display = 'flex';
    
    // Get form data
    const formData = new FormData(ideaForm);
    const ideaData = {
        name: formData.get('name'),
        email: formData.get('email'),
        category: formData.get('category'),
        title: formData.get('title'),
        description: formData.get('description'),
        sources: formData.get('sources') || '',
        status: 'pending',
        createdAt: serverTimestamp()
    };
    
    try {
        // Add document to Firestore
        await addDoc(collection(db, 'ideas'), ideaData);
        
        // Hide loading overlay
        loadingOverlay.style.display = 'none';
        
        // Show success modal
        successModal.style.display = 'flex';
        
        // Reset form
        ideaForm.reset();
        
        console.log('Ide berhasil dikirim!');
    } catch (error) {
        console.error('Error mengirim ide:', error);
        loadingOverlay.style.display = 'none';
        alert('Terjadi kesalahan saat mengirim ide. Silakan coba lagi.');
    }
});

// Close modal
closeModal.addEventListener('click', function() {
    successModal.style.display = 'none';
});

// Close modal when clicking outside
successModal.addEventListener('click', function(e) {
    if (e.target === successModal) {
        successModal.style.display = 'none';
    }
});

// Admin login
loginBtn.addEventListener('click', function() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        adminContent.style.display = 'block';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        adminPassword.style.display = 'none';
        loadIdeas();
    } else {
        alert('Password salah!');
        adminPassword.value = '';
    }
});

// Admin logout
logoutBtn.addEventListener('click', function() {
    adminContent.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    adminPassword.style.display = 'inline-block';
    adminPassword.value = '';
    ideasGrid.innerHTML = '';
});

// Load ideas for admin
async function loadIdeas() {
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
    
    const createdAt = idea.createdAt ? idea.createdAt.toDate().toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
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

// Update idea status
window.updateIdeaStatus = async function(ideaId, status) {
    try {
        await updateDoc(doc(db, 'ideas', ideaId), {
            status: status
        });
        
        // Reload ideas
        loadIdeas();
        
        const statusText = status === 'approved' ? 'disetujui' : 'ditolak';
        alert(`Ide berhasil ${statusText}!`);
    } catch (error) {
        console.error('Error updating idea status:', error);
        alert('Terjadi kesalahan saat mengupdate status ide.');
    }
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.stat-item, .idea-card, .profile-card, .mission');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
});

// Add particle effect to hero section
function createParticles() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = 'rgba(255, 255, 255, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        hero.appendChild(particle);
    }
}

// Initialize particles when page loads
document.addEventListener('DOMContentLoaded', createParticles);

// Add form validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6366f1';
        });
    });
});