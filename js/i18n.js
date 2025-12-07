// ============================================
// INTERNATIONALIZATION SYSTEM
// Cooperativa Provivienda "Mi Esperanza"
// ============================================

const translations = {
    es: {
        // Language selector
        selectLanguage: "Selecciona tu idioma",
        spanish: "Español",
        english: "Inglés",
        french: "Francés",
        romanian: "Rumano",
        arabic: "Árabe",

        // Welcome message
        welcomeMessage: "Bienvenido. Estás a punto de registrarte en la Cooperativa Provivienda 'Mi Esperanza', un proyecto comunitario para apoyarnos mutuamente en temas de vivienda.",

        // Landing page
        logoText: "Cooperativa Provivienda",
        logoSubtext: "Mi Esperanza",
        tagline: "Construyendo hogares, juntos.",
        registerBtn: "Registrarse como nuevo socio",
        adminBtn: "Acceder como administrador",
        chatBtn: "Chat comunitario",
        balanceBtn: "Ver Balance de la Cooperativa",
        changeLanguage: "Cambiar idioma",

        // Registration form
        registrationTitle: "Registro de Nuevo Cooperativista",
        personalInfo: "Información Personal",
        name: "Nombre",
        lastName: "Apellidos",
        city: "Ciudad donde vive",
        country: "País de nacimiento",
        phone: "Teléfono",
        email: "Correo electrónico",

        employmentInfo: "Situación Laboral y Vivienda",
        employmentStatus: "Situación laboral",
        employment_fixed: "Empleo fijo",
        employment_informal: "Empleo informal",
        employment_unemployed: "Desempleado/a",
        employment_retired: "Jubilado/a",
        employment_other: "Otro",

        housingType: "Tipo de vivienda actual",
        housing_rent: "Alquiler",
        housing_family: "Vivienda familiar",
        housing_inadequate: "Vivienda propia inadecuada",
        housing_none: "Sin vivienda",

        urgencyLevel: "Nivel de urgencia habitacional",
        urgencyHelp: "1 = Baja urgencia, 5 = Urgencia máxima",

        householdInfo: "Composición del Hogar",
        householdMembers: "Número de personas en el hogar",
        householdMembersHelp: "Incluyéndote a ti",
        memberName: "Nombre",
        memberLastName: "Apellido",
        memberAge: "Edad",
        addMember: "Agregar persona",
        removeMember: "Eliminar",

        additionalInfo: "Información Adicional (Opcional)",
        additionalInfoPlaceholder: "¿Quieres incluir más información relevante?",

        submitBtn: "Registrar",
        cancelBtn: "Cancelar",
        backBtn: "Volver",

        // Validation messages
        required: "Este campo es obligatorio",
        invalidEmail: "Correo electrónico inválido",
        invalidPhone: "Teléfono inválido",
        minMembers: "Debe haber al menos 1 persona en el hogar",

        // Success messages
        registrationSuccess: "Tus datos han sido registrados en la Cooperativa Provivienda 'Mi Esperanza'. Bienvenido, cooperativista.",

        // Admin panel
        adminTitle: "Panel Administrativo",
        adminPassword: "Contraseña de administrador",
        loginBtn: "Ingresar",
        logoutBtn: "Cerrar sesión",
        incorrectPassword: "Contraseña incorrecta",

        memberManagement: "Gestión de Cooperativistas",
        financialDashboard: "Panel de Mando Financiero",

        searchPlaceholder: "Buscar por nombre...",
        filterByCity: "Filtrar por ciudad",
        filterByUrgency: "Urgencia ≥ 4",
        filterByPayment: "Pagos pendientes",
        clearFilters: "Limpiar filtros",

        exportCSV: "Exportar CSV",
        exportPassword: "Ingresa la contraseña para exportar",

        // Table headers
        nameHeader: "Nombre",
        cityHeader: "Ciudad",
        urgencyHeader: "Urgencia",
        functionHeader: "Función",
        paymentsHeader: "Pagos",
        actionsHeader: "Acciones",

        editBtn: "Editar",
        deleteBtn: "Eliminar",
        saveBtn: "Guardar",

        confirmDelete: "¿Estás seguro de eliminar este cooperativista?",

        // Payment months
        january: "Ene",
        february: "Feb",
        march: "Mar",
        april: "Abr",
        may: "May",
        june: "Jun",
        july: "Jul",
        august: "Ago",
        september: "Sep",
        october: "Oct",
        november: "Nov",
        december: "Dic",

        // Financial dashboard
        incomeTitle: "Registro de Ingresos",
        expenseTitle: "Registro de Gastos",
        balanceTitle: "Balance General",

        amount: "Monto",
        date: "Fecha",
        category: "Categoría",
        description: "Descripción",
        source: "Fuente",

        // Expense categories
        category_materials: "Materiales",
        category_social: "Apoyo social",
        category_procedures: "Trámites",
        category_emergency: "Emergencias",
        category_other: "Otros",

        // Income sources
        source_fees: "Cuotas",
        source_donations: "Donaciones",
        source_activities: "Actividades",
        source_other: "Otros ingresos",

        totalIncome: "Ingresos Totales",
        totalExpenses: "Gastos Totales",
        currentBalance: "Balance Actual",

        addIncome: "Agregar Ingreso",
        addExpense: "Agregar Gasto",

        emergencyFund: "Fondo de Emergencia",
        aidRegistry: "Registro de Ayudas Otorgadas",
        recipient: "Beneficiario",
        aidAmount: "Monto de ayuda",

        // Public balance
        balancePageTitle: "Balance de la Cooperativa",
        transparencyMessage: "La contabilidad de nuestra cooperativa es transparente para todos los miembros. Aquí puedes ver el resumen financiero actualizado.",
        detailsAdminOnly: "Los detalles completos están disponibles solo para administradores.",

        // Access Screen
        accessTitle: "Accesso a Socios",
        accessSubtitle: "Introduce el código para entrar",
        enterBtn: "Entrar",
        accessError: "Código incorrecto. Inténtalo de nuevo.",
        accessHelp: "El código predeterminado es:",

        // Share App
        shareBtn: "Compartir App (QR)",

        // Chat
        chatTitle: "Chat Comunitario",
        yourName: "Tu nombre",
        yourMessage: "Tu mensaje",
        sendBtn: "Enviar",
        noMessages: "No hay mensajes aún. ¡Sé el primero en escribir!",
        deleteMessage: "Eliminar mensaje",

        // General
        loading: "Cargando...",
        noData: "No hay datos disponibles",
        error: "Error",
        success: "Éxito"
    },

    en: {
        // Language selector
        selectLanguage: "Select your language",
        spanish: "Spanish",
        english: "English",
        french: "French",
        romanian: "Romanian",
        arabic: "Arabic",

        // Welcome message
        welcomeMessage: "Welcome. You are about to register in the Housing Cooperative 'Mi Esperanza', a community project to support each other in housing needs.",

        // Landing page
        logoText: "Housing Cooperative",
        logoSubtext: "Mi Esperanza",
        tagline: "Building homes, together.",
        registerBtn: "Register as new member",
        adminBtn: "Admin access",
        chatBtn: "Community chat",
        balanceBtn: "View Cooperative Balance",
        changeLanguage: "Change language",

        // Registration form
        registrationTitle: "New Member Registration",
        personalInfo: "Personal Information",
        name: "First Name",
        lastName: "Last Name",
        city: "City of residence",
        country: "Country of birth",
        phone: "Phone",
        email: "Email",

        employmentInfo: "Employment and Housing Situation",
        employmentStatus: "Employment status",
        employment_fixed: "Permanent employment",
        employment_informal: "Informal employment",
        employment_unemployed: "Unemployed",
        employment_retired: "Retired",
        employment_other: "Other",

        housingType: "Current housing type",
        housing_rent: "Rental",
        housing_family: "Family housing",
        housing_inadequate: "Inadequate own housing",
        housing_none: "Homeless",

        urgencyLevel: "Housing urgency level",
        urgencyHelp: "1 = Low urgency, 5 = Maximum urgency",

        householdInfo: "Household Composition",
        householdMembers: "Number of people in household",
        householdMembersHelp: "Including yourself",
        memberName: "Name",
        memberLastName: "Last Name",
        memberAge: "Age",
        addMember: "Add person",
        removeMember: "Remove",

        additionalInfo: "Additional Information (Optional)",
        additionalInfoPlaceholder: "Would you like to include any additional relevant information?",

        submitBtn: "Register",
        cancelBtn: "Cancel",
        backBtn: "Back",

        // Validation messages
        required: "This field is required",
        invalidEmail: "Invalid email",
        invalidPhone: "Invalid phone number",
        minMembers: "There must be at least 1 person in the household",

        // Success messages
        registrationSuccess: "Your data has been registered in the Housing Cooperative 'Mi Esperanza'. Welcome, member.",

        // Admin panel
        adminTitle: "Admin Panel",
        adminPassword: "Admin password",
        loginBtn: "Login",
        logoutBtn: "Logout",
        incorrectPassword: "Incorrect password",

        memberManagement: "Member Management",
        financialDashboard: "Financial Dashboard",

        searchPlaceholder: "Search by name...",
        filterByCity: "Filter by city",
        filterByUrgency: "Urgency ≥ 4",
        filterByPayment: "Pending payments",
        clearFilters: "Clear filters",

        exportCSV: "Export CSV",
        exportPassword: "Enter password to export",

        // Table headers
        nameHeader: "Name",
        cityHeader: "City",
        urgencyHeader: "Urgency",
        functionHeader: "Function",
        paymentsHeader: "Payments",
        actionsHeader: "Actions",

        editBtn: "Edit",
        deleteBtn: "Delete",
        saveBtn: "Save",

        confirmDelete: "Are you sure you want to delete this member?",

        // Payment months
        january: "Jan",
        february: "Feb",
        march: "Mar",
        april: "Apr",
        may: "May",
        june: "Jun",
        july: "Jul",
        august: "Aug",
        september: "Sep",
        october: "Oct",
        november: "Nov",
        december: "Dec",

        // Financial dashboard
        incomeTitle: "Income Registry",
        expenseTitle: "Expense Registry",
        balanceTitle: "General Balance",

        amount: "Amount",
        date: "Date",
        category: "Category",
        description: "Description",
        source: "Source",

        // Expense categories
        category_materials: "Materials",
        category_social: "Social support",
        category_procedures: "Procedures",
        category_emergency: "Emergencies",
        category_other: "Other",

        // Income sources
        source_fees: "Membership fees",
        source_donations: "Donations",
        source_activities: "Activities",
        source_other: "Other income",

        totalIncome: "Total Income",
        totalExpenses: "Total Expenses",
        currentBalance: "Current Balance",

        addIncome: "Add Income",
        addExpense: "Add Expense",

        emergencyFund: "Emergency Fund",
        aidRegistry: "Aid Distribution Registry",
        recipient: "Recipient",
        aidAmount: "Aid amount",

        // Public balance
        balancePageTitle: "Cooperative Balance",
        transparencyMessage: "Our cooperative's accounting is transparent for all members. Here you can see the updated financial summary.",
        detailsAdminOnly: "Full details are available only to administrators.",

        // Access Screen
        accessTitle: "Member Access",
        accessSubtitle: "Enter the code to enter",
        enterBtn: "Enter",
        accessError: "Incorrect code. Please try again.",
        accessHelp: "The default code is:",

        // Share App
        shareBtn: "Share App (QR)",

        // Chat
        chatTitle: "Community Chat",
        yourName: "Your name",
        yourMessage: "Your message",
        sendBtn: "Send",
        noMessages: "No messages yet. Be the first to write!",
        deleteMessage: "Delete message",

        // General
        loading: "Loading...",
        noData: "No data available",
        error: "Error",
        success: "Success"
    },

    fr: {
        // Language selector
        selectLanguage: "Sélectionnez votre langue",
        spanish: "Espagnol",
        english: "Anglais",
        french: "Français",
        romanian: "Roumain",
        arabic: "Arabe",

        // Welcome message
        welcomeMessage: "Bienvenue. Vous allez vous inscrire à la Coopérative de logement 'Mi Esperanza', un projet communautaire d'entraide pour le logement.",

        // Landing page
        logoText: "Coopérative de Logement",
        logoSubtext: "Mi Esperanza",
        tagline: "Construire des foyers, ensemble.",
        registerBtn: "S'inscrire comme nouveau membre",
        adminBtn: "Accès administrateur",
        chatBtn: "Chat communautaire",
        balanceBtn: "Voir le Bilan de la Coopérative",
        changeLanguage: "Changer de langue",

        // Registration form
        registrationTitle: "Inscription Nouveau Membre",
        personalInfo: "Informations Personnelles",
        name: "Prénom",
        lastName: "Nom",
        city: "Ville de résidence",
        country: "Pays de naissance",
        phone: "Téléphone",
        email: "Email",

        employmentInfo: "Situation Professionnelle et Logement",
        employmentStatus: "Situation professionnelle",
        employment_fixed: "Emploi permanent",
        employment_informal: "Emploi informel",
        employment_unemployed: "Sans emploi",
        employment_retired: "Retraité(e)",
        employment_other: "Autre",

        housingType: "Type de logement actuel",
        housing_rent: "Location",
        housing_family: "Logement familial",
        housing_inadequate: "Logement inadéquat",
        housing_none: "Sans logement",

        urgencyLevel: "Niveau d'urgence de logement",
        urgencyHelp: "1 = Faible urgence, 5 = Urgence maximale",

        householdInfo: "Composition du Ménage",
        householdMembers: "Nombre de personnes dans le ménage",
        householdMembersHelp: "Vous y compris",
        memberName: "Prénom",
        memberLastName: "Nom",
        memberAge: "Âge",
        addMember: "Ajouter une personne",
        removeMember: "Supprimer",

        additionalInfo: "Informations Complémentaires (Optionnel)",
        additionalInfoPlaceholder: "Souhaitez-vous ajouter des informations supplémentaires?",

        submitBtn: "S'inscrire",
        cancelBtn: "Annuler",
        backBtn: "Retour",

        // Validation messages
        required: "Ce champ est obligatoire",
        invalidEmail: "Email invalide",
        invalidPhone: "Numéro de téléphone invalide",
        minMembers: "Il doit y avoir au moins 1 personne dans le ménage",

        // Success messages
        registrationSuccess: "Vos données ont été enregistrées dans la Coopérative de Logement 'Mi Esperanza'. Bienvenue, membre.",

        // Admin panel
        adminTitle: "Panneau d'Administration",
        adminPassword: "Mot de passe administrateur",
        loginBtn: "Connexion",
        logoutBtn: "Déconnexion",
        incorrectPassword: "Mot de passe incorrect",

        memberManagement: "Gestion des Membres",
        financialDashboard: "Tableau de Bord Financier",

        searchPlaceholder: "Rechercher par nom...",
        filterByCity: "Filtrer par ville",
        filterByUrgency: "Urgence ≥ 4",
        filterByPayment: "Paiements en attente",
        clearFilters: "Effacer les filtres",

        exportCSV: "Exporter CSV",
        exportPassword: "Entrez le mot de passe pour exporter",

        // Table headers
        nameHeader: "Nom",
        cityHeader: "Ville",
        urgencyHeader: "Urgence",
        functionHeader: "Fonction",
        paymentsHeader: "Paiements",
        actionsHeader: "Actions",

        editBtn: "Modifier",
        deleteBtn: "Supprimer",
        saveBtn: "Enregistrer",

        confirmDelete: "Êtes-vous sûr de vouloir supprimer ce membre?",

        // Payment months
        january: "Jan",
        february: "Fév",
        march: "Mar",
        april: "Avr",
        may: "Mai",
        june: "Juin",
        july: "Juil",
        august: "Aoû",
        september: "Sep",
        october: "Oct",
        november: "Nov",
        december: "Déc",

        // Financial dashboard
        incomeTitle: "Registre des Revenus",
        expenseTitle: "Registre des Dépenses",
        balanceTitle: "Bilan Général",

        amount: "Montant",
        date: "Date",
        category: "Catégorie",
        description: "Description",
        source: "Source",

        // Expense categories
        category_materials: "Matériaux",
        category_social: "Aide sociale",
        category_procedures: "Procédures",
        category_emergency: "Urgences",
        category_other: "Autres",

        // Income sources
        source_fees: "Cotisations",
        source_donations: "Dons",
        source_activities: "Activités",
        source_other: "Autres revenus",

        totalIncome: "Revenus Totaux",
        totalExpenses: "Dépenses Totales",
        currentBalance: "Solde Actuel",

        addIncome: "Ajouter un Revenu",
        addExpense: "Ajouter une Dépense",

        emergencyFund: "Fonds d'Urgence",
        aidRegistry: "Registre des Aides Distribuées",
        recipient: "Bénéficiaire",
        aidAmount: "Montant de l'aide",

        // Public balance
        balancePageTitle: "Bilan de la Coopérative",
        transparencyMessage: "La comptabilité de notre coopérative est transparente pour tous les membres. Vous pouvez voir ici le résumé financier actualisé.",
        detailsAdminOnly: "Les détails complets sont disponibles uniquement pour les administrateurs.",

        // Chat
        chatTitle: "Chat Communautaire",
        yourName: "Votre nom",
        yourMessage: "Votre message",
        sendBtn: "Envoyer",
        noMessages: "Pas encore de messages. Soyez le premier à écrire!",
        deleteMessage: "Supprimer le message",

        // General
        loading: "Chargement...",
        noData: "Aucune donnée disponible",
        error: "Erreur",
        success: "Succès"
    },

    ro: {
        // Language selector
        selectLanguage: "Selectează limba",
        spanish: "Spaniolă",
        english: "Engleză",
        french: "Franceză",
        romanian: "Română",
        arabic: "Arabă",

        // Welcome message
        welcomeMessage: "Bun venit. Urmează să te înregistrezi în Cooperativa de Locuințe 'Mi Esperanza', un proiect comunitar de sprijin pentru locuințe.",

        // Landing page
        logoText: "Cooperativa de Locuințe",
        logoSubtext: "Mi Esperanza",
        tagline: "Construim case, împreună.",
        registerBtn: "Înregistrare membru nou",
        adminBtn: "Acces administrator",
        chatBtn: "Chat comunitar",
        balanceBtn: "Vezi Balanța Cooperativei",
        changeLanguage: "Schimbă limba",

        // Registration form
        registrationTitle: "Înregistrare Membru Nou",
        personalInfo: "Informații Personale",
        name: "Prenume",
        lastName: "Nume",
        city: "Oraș de reședință",
        country: "Țara de naștere",
        phone: "Telefon",
        email: "Email",

        employmentInfo: "Situația Profesională și Locuință",
        employmentStatus: "Situația profesională",
        employment_fixed: "Angajare permanentă",
        employment_informal: "Angajare informală",
        employment_unemployed: "Șomer/ă",
        employment_retired: "Pensionar/ă",
        employment_other: "Altele",

        housingType: "Tipul locuinței actuale",
        housing_rent: "Chirie",
        housing_family: "Locuință familială",
        housing_inadequate: "Locuință proprie inadecvată",
        housing_none: "Fără locuință",

        urgencyLevel: "Nivel de urgență pentru locuință",
        urgencyHelp: "1 = Urgență scăzută, 5 = Urgență maximă",

        householdInfo: "Compoziția Gospodăriei",
        householdMembers: "Număr de persoane în gospodărie",
        householdMembersHelp: "Inclusiv tu",
        memberName: "Prenume",
        memberLastName: "Nume",
        memberAge: "Vârstă",
        addMember: "Adaugă persoană",
        removeMember: "Elimină",

        additionalInfo: "Informații Suplimentare (Opțional)",
        additionalInfoPlaceholder: "Dorești să incluzi informații suplimentare relevante?",

        submitBtn: "Înregistrare",
        cancelBtn: "Anulare",
        backBtn: "Înapoi",

        // Validation messages
        required: "Acest câmp este obligatoriu",
        invalidEmail: "Email invalid",
        invalidPhone: "Număr de telefon invalid",
        minMembers: "Trebuie să fie cel puțin 1 persoană în gospodărie",

        // Success messages
        registrationSuccess: "Datele tale au fost înregistrate în Cooperativa de Locuințe 'Mi Esperanza'. Bun venit, membru.",

        // Admin panel
        adminTitle: "Panou de Administrare",
        adminPassword: "Parolă administrator",
        loginBtn: "Autentificare",
        logoutBtn: "Deconectare",
        incorrectPassword: "Parolă incorectă",

        memberManagement: "Gestionarea Membrilor",
        financialDashboard: "Tablou de Bord Financiar",

        searchPlaceholder: "Caută după nume...",
        filterByCity: "Filtrează după oraș",
        filterByUrgency: "Urgență ≥ 4",
        filterByPayment: "Plăți în așteptare",
        clearFilters: "Șterge filtrele",

        exportCSV: "Exportă CSV",
        exportPassword: "Introdu parola pentru export",

        // Table headers
        nameHeader: "Nume",
        cityHeader: "Oraș",
        urgencyHeader: "Urgență",
        functionHeader: "Funcție",
        paymentsHeader: "Plăți",
        actionsHeader: "Acțiuni",

        editBtn: "Modifică",
        deleteBtn: "Șterge",
        saveBtn: "Salvează",

        confirmDelete: "Ești sigur că vrei să ștergi acest membru?",

        // Payment months
        january: "Ian",
        february: "Feb",
        march: "Mar",
        april: "Apr",
        may: "Mai",
        june: "Iun",
        july: "Iul",
        august: "Aug",
        september: "Sep",
        october: "Oct",
        november: "Noi",
        december: "Dec",

        // Financial dashboard
        incomeTitle: "Registrul Veniturilor",
        expenseTitle: "Registrul Cheltuielilor",
        balanceTitle: "Balanță Generală",

        amount: "Sumă",
        date: "Dată",
        category: "Categorie",
        description: "Descriere",
        source: "Sursă",

        // Expense categories
        category_materials: "Materiale",
        category_social: "Sprijin social",
        category_procedures: "Proceduri",
        category_emergency: "Urgențe",
        category_other: "Altele",

        // Income sources
        source_fees: "Cotizații",
        source_donations: "Donații",
        source_activities: "Activități",
        source_other: "Alte venituri",

        totalIncome: "Venituri Totale",
        totalExpenses: "Cheltuieli Totale",
        currentBalance: "Sold Curent",

        addIncome: "Adaugă Venit",
        addExpense: "Adaugă Cheltuială",

        emergencyFund: "Fond de Urgență",
        aidRegistry: "Registrul Ajutoarelor Acordate",
        recipient: "Beneficiar",
        aidAmount: "Suma ajutorului",

        // Public balance
        balancePageTitle: "Balanța Cooperativei",
        transparencyMessage: "Contabilitatea cooperativei noastre este transparentă pentru toți membrii. Aici poți vedea rezumatul financiar actualizat.",
        detailsAdminOnly: "Detaliile complete sunt disponibile doar pentru administratori.",

        // Chat
        chatTitle: "Chat Comunitar",
        yourName: "Numele tău",
        yourMessage: "Mesajul tău",
        sendBtn: "Trimite",
        noMessages: "Încă nu sunt mesaje. Fii primul care scrie!",
        deleteMessage: "Șterge mesajul",

        // General
        loading: "Se încarcă...",
        noData: "Nu sunt date disponibile",
        error: "Eroare",
        success: "Succes"
    },

    ar: {
        // Language selector
        selectLanguage: "اختر لغتك",
        spanish: "الإسبانية",
        english: "الإنجليزية",
        french: "الفرنسية",
        romanian: "الرومانية",
        arabic: "العربية",

        // Welcome message
        welcomeMessage: "مرحبًا. أنت على وشك التسجيل في تعاونية السكن 'مي إسبيرانزا'، وهو مشروع مجتمعي للدعم في مجال السكن.",

        // Landing page
        logoText: "تعاونية السكن",
        logoSubtext: "مي إسبيرانزا",
        tagline: "نبني المنازل، معًا.",
        registerBtn: "التسجيل كعضو جديد",
        adminBtn: "دخول المسؤول",
        chatBtn: "الدردشة المجتمعية",
        balanceBtn: "عرض رصيد التعاونية",
        changeLanguage: "تغيير اللغة",

        // Registration form
        registrationTitle: "تسجيل عضو جديد",
        personalInfo: "المعلومات الشخصية",
        name: "الاسم الأول",
        lastName: "اسم العائلة",
        city: "مدينة الإقامة",
        country: "بلد الميلاد",
        phone: "الهاتف",
        email: "البريد الإلكتروني",

        employmentInfo: "حالة العمل والسكن",
        employmentStatus: "حالة العمل",
        employment_fixed: "عمل دائم",
        employment_informal: "عمل غير رسمي",
        employment_unemployed: "عاطل عن العمل",
        employment_retired: "متقاعد",
        employment_other: "أخرى",

        housingType: "نوع السكن الحالي",
        housing_rent: "إيجار",
        housing_family: "سكن عائلي",
        housing_inadequate: "سكن خاص غير مناسب",
        housing_none: "بلا مأوى",

        urgencyLevel: "مستوى الحاجة الملحة للسكن",
        urgencyHelp: "1 = حاجة منخفضة، 5 = حاجة قصوى",

        householdInfo: "تكوين الأسرة",
        householdMembers: "عدد الأشخاص في الأسرة",
        householdMembersHelp: "بما فيهم أنت",
        memberName: "الاسم",
        memberLastName: "اسم العائلة",
        memberAge: "العمر",
        addMember: "إضافة شخص",
        removeMember: "حذف",

        additionalInfo: "معلومات إضافية (اختياري)",
        additionalInfoPlaceholder: "هل تريد تضمين معلومات إضافية ذات صلة؟",

        submitBtn: "تسجيل",
        cancelBtn: "إلغاء",
        backBtn: "رجوع",

        // Validation messages
        required: "هذا الحقل مطلوب",
        invalidEmail: "بريد إلكتروني غير صالح",
        invalidPhone: "رقم هاتف غير صالح",
        minMembers: "يجب أن يكون هناك شخص واحد على الأقل في الأسرة",

        // Success messages
        registrationSuccess: "تم تسجيل بياناتك في تعاونية السكن 'مي إسبيرانزا'. مرحبًا بك، عضو.",

        // Admin panel
        adminTitle: "لوحة الإدارة",
        adminPassword: "كلمة مرور المسؤول",
        loginBtn: "تسجيل الدخول",
        logoutBtn: "تسجيل الخروج",
        incorrectPassword: "كلمة مرور غير صحيحة",

        memberManagement: "إدارة الأعضاء",
        financialDashboard: "لوحة التحكم المالية",

        searchPlaceholder: "البحث بالاسم...",
        filterByCity: "تصفية حسب المدينة",
        filterByUrgency: "حاجة ≥ 4",
        filterByPayment: "مدفوعات معلقة",
        clearFilters: "مسح الفلاتر",

        exportCSV: "تصدير CSV",
        exportPassword: "أدخل كلمة المرور للتصدير",

        // Table headers
        nameHeader: "الاسم",
        cityHeader: "المدينة",
        urgencyHeader: "الحاجة",
        functionHeader: "الوظيفة",
        paymentsHeader: "المدفوعات",
        actionsHeader: "الإجراءات",

        editBtn: "تعديل",
        deleteBtn: "حذف",
        saveBtn: "حفظ",

        confirmDelete: "هل أنت متأكد من حذف هذا العضو؟",

        // Payment months
        january: "يناير",
        february: "فبراير",
        march: "مارس",
        april: "أبريل",
        may: "مايو",
        june: "يونيو",
        july: "يوليو",
        august: "أغسطس",
        september: "سبتمبر",
        october: "أكتوبر",
        november: "نوفمبر",
        december: "ديسمبر",

        // Financial dashboard
        incomeTitle: "سجل الإيرادات",
        expenseTitle: "سجل المصروفات",
        balanceTitle: "الرصيد العام",

        amount: "المبلغ",
        date: "التاريخ",
        category: "الفئة",
        description: "الوصف",
        source: "المصدر",

        // Expense categories
        category_materials: "مواد",
        category_social: "دعم اجتماعي",
        category_procedures: "إجراءات",
        category_emergency: "حالات طوارئ",
        category_other: "أخرى",

        // Income sources
        source_fees: "رسوم العضوية",
        source_donations: "تبرعات",
        source_activities: "أنشطة",
        source_other: "إيرادات أخرى",

        totalIncome: "إجمالي الإيرادات",
        totalExpenses: "إجمالي المصروفات",
        currentBalance: "الرصيد الحالي",

        addIncome: "إضافة إيراد",
        addExpense: "إضافة مصروف",

        emergencyFund: "صندوق الطوارئ",
        aidRegistry: "سجل المساعدات الممنوحة",
        recipient: "المستفيد",
        aidAmount: "مبلغ المساعدة",

        // Public balance
        balancePageTitle: "رصيد التعاونية",
        transparencyMessage: "محاسبة تعاونيتنا شفافة لجميع الأعضاء. يمكنك هنا رؤية الملخص المالي المحدث.",
        detailsAdminOnly: "التفاصيل الكاملة متاحة فقط للمسؤولين.",

        // Chat
        chatTitle: "الدردشة المجتمعية",
        yourName: "اسمك",
        yourMessage: "رسالتك",
        sendBtn: "إرسال",
        noMessages: "لا توجد رسائل بعد. كن أول من يكتب!",
        deleteMessage: "حذف الرسالة",

        // General
        loading: "جارٍ التحميل...",
        noData: "لا توجد بيانات متاحة",
        error: "خطأ",
        success: "نجاح"
    }
};

// ============================================
// I18N HELPER FUNCTIONS
// ============================================

class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'es';
        this.translations = translations;
    }

    getStoredLanguage() {
        return localStorage.getItem('cooperativa_language');
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('cooperativa_language', lang);

            // Set HTML dir attribute for RTL languages
            if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
            }

            return true;
        }
        return false;
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    translatePage() {
        // Translate all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.value = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // Translate all elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }

    getMonthName(monthIndex) {
        const months = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        return this.t(months[monthIndex]);
    }
}

// Create global i18n instance
const i18n = new I18n();
