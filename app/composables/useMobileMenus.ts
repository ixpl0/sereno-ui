export const useMobileMenus = () => {
  const sidebarOpen = useState('mobile-sidebar-open', () => false)
  const userDropdownOpen = useState('mobile-user-dropdown-open', () => false)

  const openSidebar = () => {
    userDropdownOpen.value = false
    sidebarOpen.value = true
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const toggleSidebar = () => {
    if (sidebarOpen.value) {
      closeSidebar()
    }
    else {
      openSidebar()
    }
  }

  const openUserDropdown = () => {
    sidebarOpen.value = false
    userDropdownOpen.value = true
  }

  const closeUserDropdown = () => {
    userDropdownOpen.value = false
  }

  const toggleUserDropdown = () => {
    if (userDropdownOpen.value) {
      closeUserDropdown()
    }
    else {
      openUserDropdown()
    }
  }

  return {
    sidebarOpen: readonly(sidebarOpen),
    userDropdownOpen: readonly(userDropdownOpen),
    openSidebar,
    closeSidebar,
    toggleSidebar,
    openUserDropdown,
    closeUserDropdown,
    toggleUserDropdown,
  }
}
