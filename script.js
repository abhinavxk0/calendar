        // School events data will be loaded dynamically
        class SchoolCalendar {
            constructor(events) {
                this.events = events;
                this.currentDate = new Date();
                this.selectedSection = 'all';

                this.initializeElements();
                this.setupEventListeners();
                this.renderCalendar();
                this.renderEvents();
            }

            initializeElements() {
                this.calendarDays = document.getElementById('calendar-days');
                this.currentMonthElement = document.getElementById('current-month');
                this.prevMonthBtn = document.getElementById('prev-month');
                this.nextMonthBtn = document.getElementById('next-month');
                this.eventsContainer = document.getElementById('events-container');
                this.sectionButtons = document.querySelectorAll('.section-btn');
            }

            setupEventListeners() {
                this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
                this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
                
                this.sectionButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        // Remove active class from all buttons
                        this.sectionButtons.forEach(b => b.classList.remove('active'));
                        
                        // Add active class to clicked button
                        btn.classList.add('active');
                        
                        // Update selected section
                        this.selectedSection = btn.dataset.section;
                        
                        // Re-render events
                        this.renderEvents();
                    });
                });
            }

            changeMonth(delta) {
                this.currentDate.setMonth(this.currentDate.getMonth() + delta);
                this.renderCalendar();
                this.renderEvents();
            }

            renderCalendar() {
                const year = this.currentDate.getFullYear();
                const month = this.currentDate.getMonth();
                
                this.currentMonthElement.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
                
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                this.calendarDays.innerHTML = '';
                
                // Add padding days
                for (let i = 0; i < firstDay; i++) {
                    this.calendarDays.appendChild(document.createElement('div'));
                }
                
                // Add days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                    const dayElement = document.createElement('div');
                    dayElement.textContent = day;
                    dayElement.classList.add('calendar-day');
                    
                    const currentDate = new Date(year, month, day);
                    const dayEvents = this.events.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.toDateString() === currentDate.toDateString() &&
                               (this.selectedSection === 'all' || event.section === this.selectedSection);
                    });
                    
                    if (dayEvents.length > 0) {
                        dayElement.classList.add('has-event');
                    }
                    
                    dayElement.addEventListener('click', () => {
                        // Remove previous selections
                        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                        dayElement.classList.add('selected');
                        
                        // Render events for this day
                        this.renderEvents(dayEvents);
                    });
                    
                    this.calendarDays.appendChild(dayElement);
                }
            }

            renderEvents(specificEvents = null) {
                // If no specific events provided, get events for current month and section
                let eventsToShow = specificEvents || this.events.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.getFullYear() === this.currentDate.getFullYear() &&
                           eventDate.getMonth() === this.currentDate.getMonth() &&
                           (this.selectedSection === 'all' || event.section === this.selectedSection);
                });

                // Sort events by date
                eventsToShow.sort((a, b) => new Date(a.date) - new Date(b.date));

                this.eventsContainer.innerHTML = eventsToShow.length > 0 
                    ? eventsToShow.map(event => `
                        <div class="event-item">
                            <div class="event-date">${new Date(event.date).toLocaleDateString('en-US', {
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                            })}</div>
                            <div class="event-title">${this.escapeHtml(event.title)}</div>
                            <div class="event-section">${this.escapeHtml(event.section)} Section</div>
                            <div class="event-description">${this.escapeHtml(event.description)}</div>
                        </div>
                    `).join('') 
                    : '<p>No events found</p>';
            }

            // Helper method to prevent XSS
            escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
        }

        // Fetch and initialize the calendar
        async function initializeCalendar() {
            try {
                // In a real-world scenario, you'd fetch from an actual API or file
                const response = await fetch('school-calendar-full-json.json');
                const schoolEvents = await response.json();
                
                // Initialize the calendar once data is loaded
                window.schoolCalendar = new SchoolCalendar(schoolEvents.events);
            } catch (error) {
                console.error('Error loading events:', error);
                
                // Fallback to local data if fetch fails
                const fallbackEvents = `${JSON.stringify(schoolEvents.events)}`;
                window.schoolCalendar = new SchoolCalendar(fallbackEvents);
            }
        }

        // Initialize when DOM is fully loaded
        document.addEventListener('DOMContentLoaded', initializeCalendar);