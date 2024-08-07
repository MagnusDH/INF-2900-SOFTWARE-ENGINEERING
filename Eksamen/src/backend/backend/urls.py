from django.urls import include, path
from rest_framework import routers

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('skooba/', include('skooba.urls')),
    path('api-auth/', include('rest_framework.urls'))
]
