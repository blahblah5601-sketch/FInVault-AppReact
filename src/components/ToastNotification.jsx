// src/components/ToastNotification.jsx

function ToastNotification({ message, isVisible }) {
  // Use CSS transitions for the slide-in/slide-out effect
  const toastClasses = `fixed bottom-5 right-5 bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
  }`;

  return (
    <div id="toast-notification" className={toastClasses}>
      <p id="toast-message">{message}</p>
    </div>
  );
}

export default ToastNotification;