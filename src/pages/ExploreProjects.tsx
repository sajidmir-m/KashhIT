import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, Package } from 'lucide-react';
import { iotProjects } from '@/data/iotProjects';

const ExploreProjects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter projects based on search query
  const filteredProjects = iotProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.components.some(comp => comp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Explore IoT Projects</h1>
            <p className="text-gray-600 text-lg">Discover {iotProjects.length} innovative IoT projects with detailed guides and components</p>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects by name, description, or components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredProjects.length} of {iotProjects.length} projects
            </p>
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer group"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    <CardHeader className="p-0">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <CardTitle className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {project.shortDescription}
                      </p>
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Components:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.components.slice(0, 3).map((comp, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            >
                              {comp}
                            </span>
                          ))}
                          {project.components.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              +{project.components.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(project.id);
                        }}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="object-cover w-full h-full sm:w-48 sm:h-full group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mb-4">
                          {project.shortDescription}
                        </p>
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Components Used:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.components.map((comp, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(project.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreProjects;

