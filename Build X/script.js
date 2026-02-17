// Clear corrupted localStorage to fix Auth Token issues
localStorage.clear();

// Supabase Configuration with In-Memory Storage (Fix for Browser Blocking)
const SUPABASE_URL = 'https://yryxlyrrziwvqlxwwvrb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyeXhseXJyeml3dnFseHd3dnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTUwMTEsImV4cCI6MjA4NjI5MTAxMX0.CQHoQEliHhzsOFJaLr4yAgeXj3FtiEBirnuJvTim0sA';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false // Use in-memory storage only, prevents localStorage errors
    }
});

// Rich Mock Alumni Data with AI Matching, Availability, Tags, and Social Proof
const mockAlumni = [
    {
        id: 1,
        name: 'Amit Kumar',
        role: 'Senior Backend Engineer',
        company: 'Google',
        batch: '2020',
        availability: 'Available this week',
        tags: ['Referral', 'Backend', 'System Design'],
        rating: 4.9,
        studentsHelped: 24,
        matchScore: 98
    },
    {
        id: 2,
        name: 'Priya Sharma',
        role: 'Product Manager',
        company: 'Microsoft',
        batch: '2019',
        availability: 'Booked until Feb 20',
        tags: ['PM Interview', 'Resume Review', 'Career Advice'],
        rating: 4.7,
        studentsHelped: 18,
        matchScore: 95
    },
    {
        id: 3,
        name: 'Rahul Verma',
        role: 'Founder & CTO',
        company: 'TechStartup',
        batch: '2018',
        availability: 'Available this week',
        tags: ['Funding', 'Frontend', 'Startup Guidance'],
        rating: 5.0,
        studentsHelped: 15,
        matchScore: null
    },
    {
        id: 4,
        name: 'Sneha Patel',
        role: 'Data Scientist',
        company: 'Amazon',
        batch: '2021',
        availability: 'Available this week',
        tags: ['ML Interview', 'Referral', 'Data Science'],
        rating: 4.8,
        studentsHelped: 22,
        matchScore: 92
    },
    {
        id: 5,
        name: 'Arjun Mehta',
        role: 'Engineering Manager',
        company: 'Meta',
        batch: '2017',
        availability: 'Booked until Feb 25',
        tags: ['Leadership', 'Mock Interview', 'Career Growth'],
        rating: 4.9,
        studentsHelped: 31,
        matchScore: null
    },
    {
        id: 6,
        name: 'Ananya Iyer',
        role: 'UX Designer',
        company: 'Adobe',
        batch: '2022',
        availability: 'Available this week',
        tags: ['Portfolio Review', 'Design Interview', 'Figma'],
        rating: 4.6,
        studentsHelped: 12,
        matchScore: 88
    }
];

// State
let currentUser = null;
let currentChatAlumni = null;
let allAlumni = []; // Store all alumni data
let alumniList = []; // Filtered alumni for display

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const dashboardView = document.getElementById('dashboardView');
const alumniGrid = document.getElementById('alumniGrid');
const chatModal = document.getElementById('chatModal');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatMessages = document.getElementById('chatMessages');
const chatAlumniName = document.getElementById('chatAlumniName');
const chatAvatar = document.getElementById('chatAvatar');

// Initialize
async function init() {
    loadAlumni();
    setupSearchFilter();
    setupChatHandlers();
}

// Load Alumni (Fetch from Supabase or use Rich Mock Data)
async function loadAlumni() {
    try {
        const { data, error } = await sb
            .from('alumni')
            .select('*');

        if (error) throw error;

        // Use Supabase data if available, otherwise use rich mock data
        allAlumni = data && data.length > 0 ? data : mockAlumni;
        alumniList = [...allAlumni];
    } catch (error) {
        console.log('Using rich mock data:', error);
        allAlumni = mockAlumni;
        alumniList = [...allAlumni];
    }

    renderAlumni();
}

// Setup Search Filter (Name, Company, Role, OR Tags)
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query === '') {
            alumniList = [...allAlumni];
        } else {
            alumniList = allAlumni.filter(alumni => {
                // Search in name, company, role
                const basicMatch =
                    alumni.name.toLowerCase().includes(query) ||
                    alumni.company.toLowerCase().includes(query) ||
                    alumni.role.toLowerCase().includes(query);

                // Search in tags
                const tagMatch = alumni.tags && alumni.tags.some(tag =>
                    tag.toLowerCase().includes(query)
                );

                return basicMatch || tagMatch;
            });
        }

        renderAlumni();
    });
}

// Render Alumni Cards with AI Match, Availability, Tags, and Social Proof
function renderAlumni() {
    if (!alumniGrid) return;

    alumniGrid.innerHTML = '';

    // Empty state handling
    if (alumniList.length === 0) {
        alumniGrid.innerHTML = `
            <div class="col-span-full flex justify-center">
                <div class="glass-heavy p-12 text-center max-w-md rounded-3xl animate-fadeInUp">
                    <i class="fas fa-users text-6xl mb-4 text-gray-400"></i>
                    <h3 class="text-2xl font-bold mb-2">No alumni found</h3>
                    <p class="text-gray-300">Try adjusting your search filters</p>
                </div>
            </div>
        `;
        return;
    }

    alumniList.forEach((alumni, index) => {
        const card = document.createElement('div');
        card.className = 'glass-heavy p-6 rounded-2xl animate-fadeInUp feature-card relative';
        card.style.animationDelay = `${index * 0.1}s`;

        // AI Match Badge (if matchScore > 90)
        const aiMatchBadge = alumni.matchScore && alumni.matchScore > 90 ? `
            <div class="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <span>✨</span>
                <span>${alumni.matchScore}% AI Match</span>
            </div>
        ` : '';

        // Availability Indicator
        const isAvailable = alumni.availability.toLowerCase().includes('available');
        const availabilityColor = isAvailable ? 'bg-green-500' : 'bg-red-500';
        const availabilityTextColor = isAvailable ? 'text-green-400' : 'text-red-400';
        const availabilityText = alumni.availability;

        // Generate Tags HTML
        const tagsHTML = alumni.tags.map(tag =>
            `<span class="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-white/10 border border-white/20">
                ${tag}
            </span>`
        ).join(' ');

        card.innerHTML = `
            ${aiMatchBadge}
            
            <div class="flex items-center space-x-4 mb-4 ${alumni.matchScore && alumni.matchScore > 90 ? 'mt-8' : ''}">
                <div class="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                    ${alumni.name.charAt(0)}
                </div>
                <div class="flex-1">
                    <h3 class="text-xl font-bold">${alumni.name}</h3>
                    <p class="text-sm text-gray-300">${alumni.role}</p>
                </div>
            </div>
            
            <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-300">
                    <i class="fas fa-building w-6"></i>
                    <span>${alumni.company}</span>
                </div>
                <div class="flex items-center text-sm text-gray-300">
                    <i class="fas fa-calendar w-6"></i>
                    <span>Batch of ${alumni.batch}</span>
                </div>
                <div class="flex items-center text-sm ${availabilityTextColor}">
                    <div class="w-2 h-2 rounded-full ${availabilityColor} mr-2"></div>
                    <span class="font-medium">${availabilityText}</span>
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-xs text-gray-400 mb-2">I can help with:</p>
                <div class="flex flex-wrap gap-2">
                    ${tagsHTML}
                </div>
            </div>
            
            <div class="flex items-center justify-between mb-4 pt-4 border-t border-white/10">
                <div class="flex items-center space-x-4 text-sm text-gray-400">
                    <div class="flex items-center space-x-1">
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="font-semibold text-white">${alumni.rating}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <i class="fas fa-users text-cyan-400"></i>
                        <span>Helped ${alumni.studentsHelped} students</span>
                    </div>
                </div>
            </div>
            
            <button class="btn-primary w-full connect-btn transition-transform hover:scale-105" data-alumni-id="${alumni.id}">
                <i class="fas fa-comments mr-2"></i>Connect & Chat
            </button>
        `;

        alumniGrid.appendChild(card);
    });

    // Add event listeners to connect buttons
    document.querySelectorAll('.connect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const alumniId = parseInt(e.currentTarget.getAttribute('data-alumni-id'));
            openChat(alumniId);
        });
    });
}

// Setup Chat Handlers
function setupChatHandlers() {
    if (!closeChatBtn || !sendMessageBtn || !chatInput) return;

    // Close chat button
    closeChatBtn.addEventListener('click', closeChat);

    // Send message button
    sendMessageBtn.addEventListener('click', sendMessage);

    // Enter key to send message
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Open Chat
function openChat(alumniId) {
    const alumni = allAlumni.find(a => a.id === alumniId);
    if (!alumni) return;

    currentChatAlumni = alumni;

    // Update chat header
    chatAlumniName.textContent = alumni.name;
    chatAvatar.textContent = alumni.name.charAt(0);

    // Clear previous messages
    chatMessages.innerHTML = '';

    // Add welcome message
    addMessage(`Hi! I'm ${alumni.name}. How can I help you today?`, 'received');

    // Show chat modal
    chatModal.style.display = 'flex';
}

// Close Chat
function closeChat() {
    chatModal.style.display = 'none';
    currentChatAlumni = null;
}

// Send Message
function sendMessage() {
    if (!chatInput || !currentChatAlumni) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'sent');
    chatInput.value = '';

    // Simulate alumni response after delay
    setTimeout(() => {
        const responses = [
            "That's a great question! Let me share my experience...",
            "I'd be happy to help you with that!",
            "When I was in your position, I found that...",
            "Absolutely! Here's what worked for me...",
            "Great to hear from you! Let's discuss this further.",
            "I can definitely help with that. Here's my advice...",
            "That's exactly what I went through! Let me explain..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'received');
    }, 1500);
}

// Add Message to Chat
function addMessage(content, type) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${type === 'sent' ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${type === 'sent'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : 'glass border border-white/20 text-gray-100'
        }`;
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Smart Login with Auto-Signup
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Disable button and show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Authenticating...';

    // Emergency Admin Backdoor for Demo
    if (email === 'admin' && password === 'admin') {
        currentUser = 'admin@demo.com';

        Swal.fire({
            icon: 'success',
            title: 'Demo Mode Activated 🚀',
            text: 'Welcome to the demo!',
            timer: 1500,
            showConfirmButton: false,
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff'
        });

        setTimeout(() => {
            document.querySelector('section').style.display = 'none';
            document.querySelectorAll('section')[1].style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            dashboardView.style.display = 'block';
        }, 1500);

        return;
    }

    try {
        // Step 1: Attempt Sign In
        const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
            email: email,
            password: password
        });

        // Step 2: Handle Sign In Success
        if (!signInError && signInData) {
            currentUser = email;

            Swal.fire({
                icon: 'success',
                title: 'Welcome Back! 🎉',
                text: 'Login successful',
                timer: 1500,
                showConfirmButton: false,
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff'
            });

            setTimeout(() => {
                document.querySelector('section').style.display = 'none';
                document.querySelectorAll('section')[1].style.display = 'none';
                document.querySelector('footer').style.display = 'none';
                dashboardView.style.display = 'block';
            }, 1500);

            return;
        }

        // Step 3: Handle Sign In Failure - Auto Sign Up for New Users
        if (signInError && signInError.message.includes('Invalid login credentials')) {
            console.log('User not found, attempting auto sign-up...');

            // Attempt Sign Up
            const { data: signUpData, error: signUpError } = await sb.auth.signUp({
                email: email,
                password: password
            });

            if (!signUpError && signUpData) {
                currentUser = email;

                Swal.fire({
                    icon: 'success',
                    title: 'Account Created! 🎉',
                    text: 'Welcome to Alumni Connect',
                    timer: 1500,
                    showConfirmButton: false,
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff'
                });

                setTimeout(() => {
                    document.querySelector('section').style.display = 'none';
                    document.querySelectorAll('section')[1].style.display = 'none';
                    document.querySelector('footer').style.display = 'none';
                    dashboardView.style.display = 'block';
                }, 1500);

                return;
            }

            // If Sign Up also failed, throw that error
            if (signUpError) {
                throw signUpError;
            }
        }

        // If it's a different error, throw it
        if (signInError) {
            throw signInError;
        }

    } catch (error) {
        // Reset button on error
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-arrow-right mr-2"></i>Start Your Journey';

        Swal.fire({
            icon: 'error',
            title: 'Authentication Failed',
            text: error.message || 'Please check your credentials and try again',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff'
        });
    }
});

// Initialize App
init();
