document.addEventListener("DOMContentLoaded", async () => {
  const statusDiv = document.getElementById("calendar-status");

  try {
    const response = await fetch('/api/calendar');
    const data = await response.json();

    if (data.success && data.bookedDates.length > 0) {
      let html = '<strong>Prochaines périodes occupées :</strong><ul style="margin-top: 0.5rem; padding-left: 1.2rem;">';
      
      // Trier et afficher les 5 prochaines réservations
      data.bookedDates.slice(0, 5).forEach(booking => {
        const start = new Date(booking.start).toLocaleDateString('fr-FR');
        const end = new Date(booking.end).toLocaleDateString('fr-FR');
        html += `<li>Du ${start} au ${end}</li>`;
      });
      
      html += '</ul>';
      statusDiv.innerHTML = html;
    } else {
      statusDiv.innerHTML = '✨ <strong>Bonne nouvelle !</strong> Le calendrier semble grand ouvert pour vos prochaines dates.';
    }
  } catch (error) {
    statusDiv.innerHTML = 'Impossible de charger le calendrier pour le moment.';
    console.error(error);
  }
});
