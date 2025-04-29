const handleDeleteProject = async (projectId: string, adminPassword: string) => {
    try {
        const response = await deleteProject(projectId, adminPassword);
        if (response.status === 204) {
            // Rafraîchir la liste des projets
            const updatedProjects = projects.filter(project => project.id !== projectId);
            setProjects(updatedProjects);
            toast({
                title: "Projet supprimé",
                description: "Le projet a été supprimé avec succès.",
                variant: "success",
            });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la suppression du projet.",
            variant: "destructive",
        });
    }
}; 