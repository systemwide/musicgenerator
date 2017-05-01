# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from .models import Song, Note, Rating

# Create your views here.


def song_list(request):
    songs = Song.objects.all()[:5]

    template = 'termproject/music-generator.html'
    context = {
        'songs': songs,
    }
    return render(request, template, context)

